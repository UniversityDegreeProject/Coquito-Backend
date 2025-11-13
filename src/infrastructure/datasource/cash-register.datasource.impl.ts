import { prismaClient } from "../../data/postgres";
import {
  CashRegisterDatasource,
  CashRegisterEntity,
  OpenCashRegisterDto,
  CloseCashRegisterDto,
  GetCurrentCashRegisterDto,
  GetCashRegisterHistoryDto,
  HttpCustomErrors,
  PaginateResponse,
} from "../../domain";

export class CashRegisterDatasourceImpl implements CashRegisterDatasource {
  constructor() {}

  /**
   * Abre una nueva caja para un usuario
   * Validaciones:
   * 1. El usuario existe y está activo
   * 2. El usuario NO tiene ya una caja abierta
   */
  async openCashRegister(dto: OpenCashRegisterDto): Promise<CashRegisterEntity> {
    const { userId, openingAmount } = dto;

    //? Verificar que el usuario existe y está activo
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw HttpCustomErrors.notFound("Usuario no encontrado");
    }

    if (user.status !== "Activo") {
      throw HttpCustomErrors.badRequest("El usuario no está activo");
    }

    //? Verificar que el usuario NO tiene ya una caja abierta
    const existingOpenCashRegister = await prismaClient.cashRegister.findFirst({
      where: {
        userId,
        status: "Abierto",
      },
    });

    if (existingOpenCashRegister) {
      throw HttpCustomErrors.badRequest("El usuario ya tiene una caja abierta");
    }

    //? Crear nueva caja
    const newCashRegister = await prismaClient.cashRegister.create({
      data: {
        userId,
        openingAmount,
        openedAt: new Date(),
        status: "Abierto",
        totalSales: 0,
        totalOrders: 0,
        cashSales: 0,
        cardSales: 0,
        qrSales: 0,
      },
      include: {
        user: true,
      },
    });

    return CashRegisterEntity.mapFromPrisma(newCashRegister);
  }

  /**
   * Cierra una caja existente
   * Calcula automáticamente:
   * - expectedAmount: openingAmount + totalSales
   * - difference: closingAmount - expectedAmount
   */
  async closeCashRegister(dto: CloseCashRegisterDto): Promise<CashRegisterEntity> {
    const { cashRegisterId, closingAmount, notes } = dto;

    //? Verificar que la caja existe y está abierta
    const cashRegister = await prismaClient.cashRegister.findUnique({
      where: { id: cashRegisterId },
    });

    if (!cashRegister) {
      throw HttpCustomErrors.notFound("Caja no encontrada");
    }

    if (cashRegister.status === "Cerrado") {
      throw HttpCustomErrors.badRequest("La caja ya está cerrada");
    }

    //? Calcular el monto esperado: openingAmount + totalSales
    const openingAmountNumber = typeof cashRegister.openingAmount === 'object' && 'toNumber' in cashRegister.openingAmount
      ? cashRegister.openingAmount.toNumber()
      : Number(cashRegister.openingAmount);

    const totalSalesNumber = typeof cashRegister.totalSales === 'object' && 'toNumber' in cashRegister.totalSales
      ? cashRegister.totalSales.toNumber()
      : Number(cashRegister.totalSales);

    const expectedAmount = openingAmountNumber + totalSalesNumber;

    //? Calcular la diferencia: closingAmount - expectedAmount
    const difference = closingAmount - expectedAmount;

    //? Cerrar la caja
    const closedCashRegister = await prismaClient.cashRegister.update({
      where: { id: cashRegisterId },
      data: {
        closingAmount,
        expectedAmount,
        difference,
        closedAt: new Date(),
        status: "Cerrado",
        notes: notes || null,
      },
      include: {
        user: true,
      },
    });

    return CashRegisterEntity.mapFromPrisma(closedCashRegister);
  }

  /**
   * Obtiene la caja actualmente abierta de un usuario
   * Retorna null si no tiene caja abierta
   */
  async getCurrentCashRegister(dto: GetCurrentCashRegisterDto): Promise<CashRegisterEntity | null> {
    const { userId } = dto;

    const currentCashRegister = await prismaClient.cashRegister.findFirst({
      where: {
        userId,
        status: "Abierto",
      },
      include: {
        user: true,
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    if (!currentCashRegister) {
      return null;
    }

    return CashRegisterEntity.mapFromPrisma(currentCashRegister);
  }

  /**
   * Obtiene una caja por su ID
   */
  async getCashRegisterById(cashRegisterId: string): Promise<CashRegisterEntity> {
    const cashRegister = await prismaClient.cashRegister.findUnique({
      where: { id: cashRegisterId },
      include: {
        user: true,
      },
    });

    if (!cashRegister) {
      throw HttpCustomErrors.notFound("Caja no encontrada");
    }

    return CashRegisterEntity.mapFromPrisma(cashRegister);
  }

  /**
   * Actualiza los totales de una caja cuando se registra una venta
   * Se usa internamente cuando se crea una Order
   */
  async updateCashRegisterTotals(
    cashRegisterId: string,
    orderTotal: number,
    paymentMethod: "Efectivo" | "Tarjeta" | "QR"
  ): Promise<void> {
    //? Obtener la caja actual
    const cashRegister = await prismaClient.cashRegister.findUnique({
      where: { id: cashRegisterId },
    });

    if (!cashRegister) {
      throw HttpCustomErrors.notFound("Caja no encontrada");
    }

    if (cashRegister.status === "Cerrado") {
      throw HttpCustomErrors.badRequest("No se puede registrar una venta en una caja cerrada");
    }

    //? Preparar los incrementos según el método de pago
    const incrementData: any = {
      totalSales: { increment: orderTotal },
      totalOrders: { increment: 1 },
    };

    if (paymentMethod === "Efectivo") {
      incrementData.cashSales = { increment: orderTotal };
    } else if (paymentMethod === "Tarjeta") {
      incrementData.cardSales = { increment: orderTotal };
    } else if (paymentMethod === "QR") {
      incrementData.qrSales = { increment: orderTotal };
    }

    //? Actualizar la caja
    await prismaClient.cashRegister.update({
      where: { id: cashRegisterId },
      data: incrementData,
    });
  }

  /**
   * Obtiene el historial de cierres de caja con paginación
   * Solo retorna cajas cerradas, ordenadas por fecha de cierre descendente
   */
  async getCashRegisterHistory(dto: GetCashRegisterHistoryDto): Promise<PaginateResponse<CashRegisterEntity>> {
    const { userId, startDate, endDate, page, limit } = dto;

    //? Construir el where dinámico
    const where: any = {
      status: "Cerrado", // Solo cajas cerradas
    };

    if (userId) {
      where.userId = userId;
    }

    // Filtro por rango de fechas (fecha de cierre)
    if (startDate || endDate) {
      where.closedAt = {};
      if (startDate) where.closedAt.gte = startDate;
      if (endDate) {
        // Ajustar endDate al final del día
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.closedAt.lte = endOfDay;
      }
    }

    //? Ejecutar consulta con paginación
    const [cashRegisters, total] = await Promise.all([
      prismaClient.cashRegister.findMany({
        where,
        include: {
          user: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          closedAt: "desc", // Más recientes primero
        },
      }),
      prismaClient.cashRegister.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: cashRegisters.map((cr) => CashRegisterEntity.mapFromPrisma(cr)),
      total,
      page,
      limit,
      totalPages,
      nextPage: page < totalPages ? `/api/cash-register/history?page=${page + 1}&limit=${limit}` : null,
      previousPage: page > 1 ? `/api/cash-register/history?page=${page - 1}&limit=${limit}` : null,
    };
  }
}

