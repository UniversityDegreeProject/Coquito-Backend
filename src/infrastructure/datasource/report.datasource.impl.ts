import { prismaClient } from "../../data/postgres";
import {
  ReportDatasource,
  DailyReportEntity,
  SalesReportEntity,
  ProductsReportEntity,
  CustomersReportEntity,
  CashRegisterSummaryReportEntity,
  CashRegisterSummaryDayEntity,
  ProductReportItemEntity,
  CustomerReportItemEntity,
  GetDailyReportDto,
  GetSalesReportDto,
  GetProductsReportDto,
  GetCustomersReportDto,
  GetCashRegisterSummaryDto,
  CashRegisterEntity,
} from "../../domain";

export class ReportDatasourceImpl implements ReportDatasource {
  constructor() {}

  /**
   * Helper para parsear fechas correctamente evitando problemas de zona horaria
   * Si la fecha viene como string YYYY-MM-DD, parsearla como fecha local (no UTC)
   */
  private parseLocalDate(date: Date | string): Date {
    if (typeof date === "string") {
      // Parsear YYYY-MM-DD como fecha local (no UTC)
      const parts = date.split("-");
      if (parts.length !== 3) {
        // Si no tiene el formato correcto, intentar parsear como Date normal
        return new Date(date);
      }
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);

      // Validar que los valores sean números válidos
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return new Date(date);
      }

      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    // Si ya es Date, crear una copia para evitar mutaciones
    const d = new Date(date);
    return d;
  }

  /**
   * Obtiene el reporte diario para una fecha específica
   */
  async getDailyReport(dto: GetDailyReportDto): Promise<DailyReportEntity> {
    const { date } = dto;

    // Convertir string a Date para la entidad
    const reportDate = this.parseLocalDate(date);
    reportDate.setHours(0, 0, 0, 0);

    // Establecer inicio y fin del día usando parseo local
    const startOfDay = this.parseLocalDate(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = this.parseLocalDate(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener cierre de caja del día (si existe)
    const cashRegister = await prismaClient.cashRegister.findFirst({
      where: {
        openedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    // Obtener ventas del día
    const sales = await prismaClient.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "Completado",
      },
    });

    // Calcular totales
    const totalSales = sales.reduce((sum, sale) => {
      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);
      return sum + total;
    }, 0);

    const totalOrders = sales.length; // Uses totalOrders to match Entity property
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calcular ventas por método de pago
    let cashSales = 0;
    let cardSales = 0;
    let qrSales = 0;

    sales.forEach((sale) => {
      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);

      if (sale.paymentMethod === "Efectivo") {
        cashSales += total;
      } else if (sale.paymentMethod === "Tarjeta") {
        cardSales += total;
      } else if (sale.paymentMethod === "QR") {
        qrSales += total;
      }
    });

    return new DailyReportEntity(
      reportDate,
      cashRegister ? CashRegisterEntity.mapFromPrisma(cashRegister) : null,
      totalSales,
      totalOrders,
      averageTicket,
      {
        cash: cashSales,
        card: cardSales,
        qr: qrSales,
      }
    );
  }

  /**
   * Obtiene el reporte de ventas en un rango de fechas
   */
  async getSalesReport(dto: GetSalesReportDto): Promise<SalesReportEntity> {
    const { startDate, endDate } = dto;

    // Convertir strings a Date para las entidades
    const reportStartDate = this.parseLocalDate(startDate);
    reportStartDate.setHours(0, 0, 0, 0);
    const reportEndDate = this.parseLocalDate(endDate);
    reportEndDate.setHours(23, 59, 59, 999);

    // Establecer inicio y fin del rango usando parseo local
    const start = this.parseLocalDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = this.parseLocalDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Obtener todas las ventas completadas en el rango
    const sales = await prismaClient.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "Completado",
      },
    });

    // Calcular totales generales
    const totalSales = sales.reduce((sum, sale) => {
      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);
      return sum + total;
    }, 0);

    const totalOrders = sales.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calcular ventas por método de pago
    let cashSales = 0;
    let cardSales = 0;
    let qrSales = 0;

    sales.forEach((sale) => {
      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);

      if (sale.paymentMethod === "Efectivo") {
        cashSales += total;
      } else if (sale.paymentMethod === "Tarjeta") {
        cardSales += total;
      } else if (sale.paymentMethod === "QR") {
        qrSales += total;
      }
    });

    // Calcular ventas por día
    const salesByDayMap = new Map<
      string,
      { date: Date; total: number; orders: number }
    >();

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      const dateKey = saleDate.toISOString().split("T")[0] || "";

      if (!dateKey) return; // Skip si no hay dateKey válido

      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);

      if (!salesByDayMap.has(dateKey)) {
        salesByDayMap.set(dateKey, {
          date: saleDate,
          total: 0,
          orders: 0,
        });
      }

      const dayData = salesByDayMap.get(dateKey)!;
      dayData.total += total;
      dayData.orders += 1;
    });

    const salesByDay = Array.from(salesByDayMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Calcular ventas por hora (0-23)
    const salesByHourMap = new Map<
      number,
      { hour: number; total: number; orders: number }
    >();

    sales.forEach((sale) => {
      const saleHour = new Date(sale.createdAt).getHours();

      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);

      if (!salesByHourMap.has(saleHour)) {
        salesByHourMap.set(saleHour, {
          hour: saleHour,
          total: 0,
          orders: 0,
        });
      }

      const hourData = salesByHourMap.get(saleHour)!;
      hourData.total += total;
      hourData.orders += 1;
    });

    // Asegurar que todas las horas (0-23) estén presentes
    const salesByHour: Array<{ hour: number; total: number; orders: number }> =
      [];
    for (let hour = 0; hour < 24; hour++) {
      salesByHour.push(
        salesByHourMap.get(hour) || { hour, total: 0, orders: 0 }
      );
    }

    return new SalesReportEntity(
      reportStartDate,
      reportEndDate,
      totalSales,
      totalOrders,
      averageTicket,
      {
        cash: cashSales,
        card: cardSales,
        qr: qrSales,
      },
      salesByDay,
      salesByHour
    );
  }

  /**
   * Obtiene el reporte de productos más vendidos
   */
  async getProductsReport(
    dto: GetProductsReportDto
  ): Promise<ProductsReportEntity> {
    const { startDate, endDate, limit } = dto;

    // Convertir strings a Date para las entidades
    const reportStartDate = this.parseLocalDate(startDate);
    reportStartDate.setHours(0, 0, 0, 0);
    const reportEndDate = this.parseLocalDate(endDate);
    reportEndDate.setHours(23, 59, 59, 999);

    // Establecer inicio y fin del rango usando parseo local
    const start = this.parseLocalDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = this.parseLocalDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Obtener ventas completadas en el rango con sus items
    const sales = await prismaClient.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "Completado",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Agregar datos por producto
    const productsMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        quantitySold: number;
        totalRevenue: number;
      }
    >();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.productId;
        const productName = item.product?.name || "Producto sin nombre";
        const quantity = item.quantity;
        const total =
          typeof item.total === "object" && "toNumber" in item.total
            ? item.total.toNumber()
            : Number(item.total);

        if (!productsMap.has(productId)) {
          productsMap.set(productId, {
            productId,
            productName,
            quantitySold: 0,
            totalRevenue: 0,
          });
        }

        const productData = productsMap.get(productId)!;
        productData.quantitySold += quantity;
        productData.totalRevenue += total;
      });
    });

    // Convertir a array y ordenar por totalRevenue descendente
    const productsArray = Array.from(productsMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    // Calcular total general para porcentajes
    const totalRevenue = productsArray.reduce(
      (sum, p) => sum + p.totalRevenue,
      0
    );

    // Agregar porcentajes
    const products = productsArray.map((product) => {
      const percentage =
        totalRevenue > 0 ? (product.totalRevenue / totalRevenue) * 100 : 0;
      return new ProductReportItemEntity(
        product.productId,
        product.productName,
        product.quantitySold,
        product.totalRevenue,
        percentage
      );
    });

    return new ProductsReportEntity(reportStartDate, reportEndDate, products);
  }

  /**
   * Obtiene el reporte de mejores clientes
   */
  async getCustomersReport(
    dto: GetCustomersReportDto
  ): Promise<CustomersReportEntity> {
    const { startDate, endDate, limit } = dto;

    // Convertir strings a Date para las entidades
    const reportStartDate = this.parseLocalDate(startDate);
    reportStartDate.setHours(0, 0, 0, 0);
    const reportEndDate = this.parseLocalDate(endDate);
    reportEndDate.setHours(23, 59, 59, 999);

    // Establecer inicio y fin del rango usando parseo local
    const start = this.parseLocalDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = this.parseLocalDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Obtener ventas completadas en el rango
    const sales = await prismaClient.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "Completado",
      },
      include: {
        customer: true,
      },
    });

    // Agregar datos por cliente
    const customersMap = new Map<
      string,
      {
        customerId: string;
        customerName: string;
        totalOrders: number;
        totalSpent: number;
      }
    >();

    sales.forEach((sale) => {
      const customerId = sale.customerId;
      if (!customerId) return; // Skip si no hay customerId

      const customerName = sale.customer
        ? `${sale.customer.firstName || ""} ${
            sale.customer.lastName || ""
          }`.trim() || "Cliente sin nombre"
        : "Cliente sin nombre";
      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);

      if (!customersMap.has(customerId)) {
        customersMap.set(customerId, {
          customerId,
          customerName,
          totalOrders: 0,
          totalSpent: 0,
        });
      }

      const customerData = customersMap.get(customerId)!;
      customerData.totalOrders += 1;
      customerData.totalSpent += total;
    });

    // Convertir a array y ordenar por totalSpent descendente
    const customersArray = Array.from(customersMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    // Calcular total general para porcentajes
    const totalSpent = customersArray.reduce((sum, c) => sum + c.totalSpent, 0);

    // Agregar porcentajes
    const customers = customersArray.map((customer) => {
      const percentage =
        totalSpent > 0 ? (customer.totalSpent / totalSpent) * 100 : 0;
      return new CustomerReportItemEntity(
        customer.customerId,
        customer.customerName,
        customer.totalOrders,
        customer.totalSpent,
        percentage
      );
    });

    return new CustomersReportEntity(reportStartDate, reportEndDate, customers);
  }

  /**
   * Obtiene el resumen de cierres de caja en un rango de fechas
   */
  async getCashRegisterSummary(
    dto: GetCashRegisterSummaryDto
  ): Promise<CashRegisterSummaryReportEntity> {
    const { startDate, endDate } = dto;

    // Convertir strings a Date para las entidades
    const reportStartDate = this.parseLocalDate(startDate);
    reportStartDate.setHours(0, 0, 0, 0);
    const reportEndDate = this.parseLocalDate(endDate);
    reportEndDate.setHours(23, 59, 59, 999);

    // Establecer inicio y fin del rango usando parseo local
    const start = this.parseLocalDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = this.parseLocalDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Obtener todos los cierres de caja en el rango
    const cashRegisters = await prismaClient.cashRegister.findMany({
      where: {
        openedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        openedAt: "asc",
      },
    });

    // Obtener ventas del rango para calcular ventas por día
    const sales = await prismaClient.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "Completado",
      },
    });

    // Agregar ventas por día
    const salesByDayMap = new Map<
      string,
      { totalSales: number; totalOrders: number }
    >();

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      const dateKey = saleDate.toISOString().split("T")[0] || "";

      if (!dateKey) return; // Skip si no hay dateKey válido

      const total =
        typeof sale.total === "object" && "toNumber" in sale.total
          ? sale.total.toNumber()
          : Number(sale.total);

      if (!salesByDayMap.has(dateKey)) {
        salesByDayMap.set(dateKey, {
          totalSales: 0,
          totalOrders: 0,
        });
      }

      const dayData = salesByDayMap.get(dateKey)!;
      dayData.totalSales += total;
      dayData.totalOrders += 1;
    });

    // Crear resumen por día
    const daysMap = new Map<string, CashRegisterSummaryDayEntity>();

    // Agregar días con cierres de caja
    cashRegisters.forEach((cr) => {
      const crDate = new Date(cr.openedAt);
      crDate.setHours(0, 0, 0, 0);
      const dateKey = crDate.toISOString().split("T")[0] || "";

      if (!dateKey) return; // Skip si no hay dateKey válido

      const openingAmount =
        typeof cr.openingAmount === "object" && "toNumber" in cr.openingAmount
          ? cr.openingAmount.toNumber()
          : Number(cr.openingAmount);

      const closingAmount = cr.closingAmount
        ? typeof cr.closingAmount === "object" && "toNumber" in cr.closingAmount
          ? cr.closingAmount.toNumber()
          : Number(cr.closingAmount)
        : null;

      const difference = cr.difference
        ? typeof cr.difference === "object" && "toNumber" in cr.difference
          ? cr.difference.toNumber()
          : Number(cr.difference)
        : null;

      const daySales = salesByDayMap.get(dateKey) || {
        totalSales: 0,
        totalOrders: 0,
      };

      daysMap.set(
        dateKey,
        new CashRegisterSummaryDayEntity(
          crDate,
          daySales.totalSales,
          daySales.totalOrders,
          cr.status as "Abierto" | "Cerrado",
          openingAmount,
          closingAmount,
          difference
        )
      );
    });

    // Agregar días sin cierres de caja pero con ventas
    salesByDayMap.forEach((sales, dateKey) => {
      if (!dateKey || daysMap.has(dateKey)) return; // Skip si no hay dateKey válido o ya existe

      const date = new Date(dateKey);
      if (isNaN(date.getTime())) return; // Skip si la fecha no es válida

      daysMap.set(
        dateKey,
        new CashRegisterSummaryDayEntity(
          date,
          sales.totalSales,
          sales.totalOrders,
          "Cerrado", // Sin caja abierta
          null,
          null,
          null
        )
      );
    });

    // Convertir a array y ordenar por fecha
    const days = Array.from(daysMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    return new CashRegisterSummaryReportEntity(
      reportStartDate,
      reportEndDate,
      days
    );
  }
}
