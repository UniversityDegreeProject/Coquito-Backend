import { CashRegisterEntity } from "./cash-register.entity";

/**
 * Entidad para Reporte Diario
 * Muestra información completa de un día específico
 */
export class DailyReportEntity {
  constructor(
    public date: Date,
    public cashRegister: CashRegisterEntity | null,
    public totalSales: number,
    public totalOrders: number,
    public averageTicket: number,
    public salesByPaymentMethod: {
      cash: number;
      card: number;
      qr: number;
    }
  ) {}
}

/**
 * Entidad para Resumen de Cierres de Caja por Rango de Fechas
 */
export class CashRegisterSummaryDayEntity {
  constructor(
    public date: Date,
    public totalSales: number,
    public totalOrders: number,
    public status: "Abierto" | "Cerrado",
    public openingAmount: number | null,
    public closingAmount: number | null,
    public difference: number | null
  ) {}
}

export class CashRegisterSummaryReportEntity {
  constructor(
    public startDate: Date,
    public endDate: Date,
    public days: CashRegisterSummaryDayEntity[]
  ) {}
}

/**
 * Entidad para Reporte de Ventas
 */
export class SalesReportEntity {
  constructor(
    public startDate: Date,
    public endDate: Date,
    public totalSales: number,
    public totalOrders: number,
    public averageTicket: number,
    public salesByPaymentMethod: {
      cash: number;
      card: number;
      qr: number;
    },
    public salesByDay: Array<{
      date: Date;
      total: number;
      orders: number;
    }>,
    public salesByHour: Array<{
      hour: number;
      total: number;
      orders: number;
    }>
  ) {}
}

/**
 * Entidad para Producto en Reporte de Productos
 */
export class ProductReportItemEntity {
  constructor(
    public productId: string,
    public productName: string,
    public quantitySold: number,
    public totalRevenue: number,
    public percentage: number
  ) {}
}

export class ProductsReportEntity {
  constructor(
    public startDate: Date,
    public endDate: Date,
    public products: ProductReportItemEntity[]
  ) {}
}

/**
 * Entidad para Cliente en Reporte de Clientes
 */
export class CustomerReportItemEntity {
  constructor(
    public customerId: string,
    public customerName: string,
    public totalOrders: number,
    public totalSpent: number,
    public percentage: number
  ) {}
}

export class CustomersReportEntity {
  constructor(
    public startDate: Date,
    public endDate: Date,
    public customers: CustomerReportItemEntity[]
  ) {}
}

