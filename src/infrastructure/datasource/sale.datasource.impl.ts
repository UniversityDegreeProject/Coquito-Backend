import { prismaClient } from "../../data/postgres";
import {
  SaleDatasource,
  SaleEntity,
  CreateSaleDto,
  GetSaleByIdDto,
  GetSalesOptionalFiltersDto,
  HttpCustomErrors,
  PaginateResponse,
} from "../../domain";

export class SaleDatasourceImpl implements SaleDatasource {
  constructor() {}

  /**
   * Genera un número de venta único
   * Formato: SLE-YYYY-NNNN (ej: SLE-2024-0001)
   */
  private async generateSaleNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `SLE-${currentYear}-`;

    //? Obtener la última venta del año actual
    const lastSale = await prismaClient.sale.findFirst({
      where: {
        saleNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lastSale) {
      // Primera venta del año
      return `${prefix}0001`;
    }

    //? Extraer el número secuencial y sumar 1
    const lastNumber = parseInt(lastSale.saleNumber.split("-")[2] || "0");
    const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

    return `${prefix}${nextNumber}`;
  }

  /**
   * Crea una nueva venta
   * LÓGICA COMPLETA:
   * 1. Validar que customer, user y cashRegister existan
   * 2. Validar stock disponible (productos fijos y batches)
   * 3. Calcular subtotal, tax, total y vuelto
   * 4. Crear la venta y sus items
   * 5. Reducir stock (productos fijos y batches)
   * 6. Crear StockMovement tipo "Venta" para cada producto
   * 7. Actualizar totales en CashRegister
   */
  async createSale(dto: CreateSaleDto): Promise<SaleEntity> {
    const {
      customerId,
      userId,
      cashRegisterId,
      items,
      paymentMethod,
      amountPaid,
      notes,
    } = dto;

    //? 1. VALIDACIONES INICIALES
    // Validar que el customer existe
    if (customerId) {
      const customer = await prismaClient.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw HttpCustomErrors.notFound("Cliente no encontrado");
      }
    }

    // Validar que el usuario existe y está activo
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw HttpCustomErrors.notFound("Usuario no encontrado");
    }
    if (user.status !== "Activo") {
      throw HttpCustomErrors.badRequest("El usuario no está activo");
    }

    // Validar que la caja existe y está abierta
    const cashRegister = await prismaClient.cashRegister.findUnique({
      where: { id: cashRegisterId },
    });
    if (!cashRegister) {
      throw HttpCustomErrors.notFound("Caja no encontrada");
    }
    if (cashRegister.status === "Cerrado") {
      throw HttpCustomErrors.badRequest(
        "No se puede registrar una venta en una caja cerrada"
      );
    }

    //? 2. VALIDAR STOCK DISPONIBLE Y PREPARAR DATOS
    interface ItemData {
      productId: string;
      quantity: number;
      unitPrice: number;
      batchId?: string;
      isVariableWeight: boolean;
    }

    const itemsData: ItemData[] = [];

    for (const item of items) {
      const { productId, quantity, unitPrice, batchId } = item;

      // Obtener el producto
      const product = await prismaClient.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw HttpCustomErrors.notFound(
          `Producto con ID ${productId} no encontrado`
        );
      }

      // CASO 1: Producto de peso variable (usa batches)
      if (product.isVariableWeight) {
        if (!batchId) {
          throw HttpCustomErrors.badRequest(
            `El producto "${product.name}" es de peso variable y requiere seleccionar un lote (batchId)`
          );
        }

        // Obtener el batch
        const batch = await prismaClient.productBatch.findUnique({
          where: { id: batchId },
        });

        if (!batch) {
          throw HttpCustomErrors.notFound(`Lote no encontrado`);
        }

        if (batch.productId !== productId) {
          throw HttpCustomErrors.badRequest(
            `El lote no pertenece al producto seleccionado`
          );
        }

        if (batch.stock < quantity) {
          throw HttpCustomErrors.badRequest(
            `Stock insuficiente en el lote. Disponible: ${batch.stock}, Solicitado: ${quantity}`
          );
        }

        itemsData.push({
          productId,
          quantity,
          unitPrice,
          batchId,
          isVariableWeight: true,
        });
      }
      // CASO 2: Producto de precio fijo (usa stock del producto)
      else {
        if (product.stock < quantity) {
          throw HttpCustomErrors.badRequest(
            `Stock insuficiente del producto "${product.name}". Disponible: ${product.stock}, Solicitado: ${quantity}`
          );
        }

        itemsData.push({
          productId,
          quantity,
          unitPrice,
          isVariableWeight: false,
        });
      }
    }

    //? 3. CALCULAR TOTALES
    const subtotal = itemsData.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = 0; // No hay impuestos según requerimientos
    const total = subtotal + tax;
    const change = amountPaid - total;

    if (change < 0) {
      throw HttpCustomErrors.badRequest(
        `El monto pagado (${amountPaid} Bs) es insuficiente. Total: ${total.toFixed(
          2
        )} Bs`
      );
    }

    //? 4. GENERAR NÚMERO DE VENTA
    const saleNumber = await this.generateSaleNumber();

    //? 5. CREAR LA VENTA Y SUS ITEMS EN UNA TRANSACCIÓN
    const newSale = await prismaClient.$transaction(async (tx) => {
      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          customerId,
          userId,
          cashRegisterId,
          subtotal,
          tax,
          total,
          paymentMethod,
          amountPaid,
          change,
          status: "Completado",
          notes: notes || null,
          completedAt: new Date(),
        },
      });

      // Crear los items de la venta
      for (const itemData of itemsData) {
        const itemTotal = itemData.quantity * itemData.unitPrice;

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: itemData.productId,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            total: itemTotal,
          },
        });

        // 6. REDUCIR STOCK
        if (itemData.isVariableWeight && itemData.batchId) {
          // Producto de peso variable: reducir stock del batch
          await tx.productBatch.update({
            where: { id: itemData.batchId },
            data: {
              stock: {
                decrement: itemData.quantity,
              },
            },
          });

          // Recalcular el stock total del producto sumando todos sus batches
          const batches = await tx.productBatch.findMany({
            where: { productId: itemData.productId },
          });
          const totalStock = batches.reduce((sum, b) => sum + b.stock, 0);

          await tx.product.update({
            where: { id: itemData.productId },
            data: {
              stock: totalStock,
            },
          });
        } else {
          // Producto de precio fijo: reducir stock directamente
          const productBefore = await tx.product.findUnique({
            where: { id: itemData.productId },
          });

          await tx.product.update({
            where: { id: itemData.productId },
            data: {
              stock: {
                decrement: itemData.quantity,
              },
            },
          });

          const productAfter = await tx.product.findUnique({
            where: { id: itemData.productId },
          });

          const customerName = customerId
            ? (await tx.customer.findUnique({ where: { id: customerId } }))
                ?.firstName
            : "Cliente General";

          // 7. CREAR STOCK MOVEMENT tipo "Venta"
          await tx.stockMovement.create({
            data: {
              productId: itemData.productId,
              userId,
              type: "Venta",
              quantity: itemData.quantity,
              previousStock: productBefore!.stock,
              newStock: productAfter!.stock,
              reason: `Venta - Nota ${saleNumber}`,
              reference: sale.id,
              notes: `Cliente: ${customerName}`,
            },
          });
        }
      }

      // Para productos de peso variable, crear un solo StockMovement por producto
      for (const itemData of itemsData) {
        if (itemData.isVariableWeight && itemData.batchId) {
          const productBefore = await tx.product.findUnique({
            where: { id: itemData.productId },
          });

          const batches = await tx.productBatch.findMany({
            where: { productId: itemData.productId },
          });
          const newStock = batches.reduce((sum, b) => sum + b.stock, 0);

          const customerName = customerId
            ? (await tx.customer.findUnique({ where: { id: customerId } }))
                ?.firstName
            : "Cliente General";

          await tx.stockMovement.create({
            data: {
              productId: itemData.productId,
              userId,
              type: "Venta",
              quantity: itemData.quantity,
              previousStock: productBefore!.stock,
              newStock: newStock,
              reason: `Venta - Nota ${saleNumber} (Batch)`,
              reference: sale.id,
              notes: `Cliente: ${customerName}, Lote: ${itemData.batchId}`,
            },
          });
        }
      }

      // 8. ACTUALIZAR TOTALES EN CASH REGISTER
      const incrementData: any = {
        totalSales: { increment: total },
        totalOrders: { increment: 1 }, // Keep totalOrders as per DB Schema
      };

      if (paymentMethod === "Efectivo") {
        incrementData.cashSales = { increment: total };
      } else if (paymentMethod === "Tarjeta") {
        incrementData.cardSales = { increment: total };
      } else if (paymentMethod === "QR") {
        incrementData.qrSales = { increment: total };
      }

      await tx.cashRegister.update({
        where: { id: cashRegisterId },
        data: incrementData,
      });

      // Retornar la venta creada con sus relaciones
      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          user: true,
          cashRegister: true,
        },
      });
    });

    if (!newSale) {
      throw HttpCustomErrors.internalServerError("Error al crear la venta");
    }

    return SaleEntity.mapFromPrisma(newSale);
  }

  /**
   * Obtiene una venta por su ID
   */
  async getSaleById(dto: GetSaleByIdDto): Promise<SaleEntity> {
    const { saleId } = dto;

    const sale = await prismaClient.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        user: true,
        cashRegister: true,
      },
    });

    if (!sale) {
      throw HttpCustomErrors.notFound("Venta no encontrada");
    }

    return SaleEntity.mapFromPrisma(sale);
  }

  /**
   * Obtiene ventas con filtros opcionales y paginación
   */
  async getSales(
    dto: GetSalesOptionalFiltersDto
  ): Promise<PaginateResponse<SaleEntity>> {
    const {
      userId,
      customerId,
      cashRegisterId,
      status,
      paymentMethod,
      startDate,
      endDate,
      page,
      limit,
    } = dto;

    //? Construir el where dinámico
    const where: any = {};

    if (userId) where.userId = userId;
    if (customerId) where.customerId = customerId;
    if (cashRegisterId) where.cashRegisterId = cashRegisterId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    // Filtro por rango de fechas
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    //? Ejecutar consulta con paginación
    const [sales, total] = await Promise.all([
      prismaClient.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          user: true,
          cashRegister: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prismaClient.sale.count({ where }),
    ]);

    return {
      data: sales.map((sale) => SaleEntity.mapFromPrisma(sale)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      nextPage:
        page < Math.ceil(total / limit)
          ? `/api/sales?page=${page + 1}&limit=${limit}`
          : null,
      previousPage:
        page > 1 ? `/api/sales?page=${page - 1}&limit=${limit}` : null,
    };
  }
}
