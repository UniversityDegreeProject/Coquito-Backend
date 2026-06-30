import { Prisma } from "../../../generated/prisma";
import { prismaClient } from "../../data/postgres";
import { HttpCustomErrors } from "../errors/http-custom-errors";
import { SaleEntity } from "../entities/sale.entity";
import type { PaymentRepository } from "../repositories/payment.repository";

interface GenerateQrItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  batchId?: string;
}

interface GenerateQrInput {
  customerId: string;
  userId: string;
  cashRegisterId: string;
  items: GenerateQrItemInput[];
  notes?: string;
}

/** Snapshot de cada ítem reservado, persistido en la sesión QR */
interface ReservedItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  batchId?: string;
  isVariableWeight: boolean;
}

export interface GenerateQrResult {
  qr_simple_url: string;
  id_transaccion: string;
  codigo_recaudacion: string;
  mensaje?: string;
}

export interface QrStatusResult {
  pagado: boolean;
  valor_total: number;
  saleCompleted: boolean;
  sale?: SaleEntity;
}

const SALE_INCLUDE = {
  items: { include: { product: true } },
  customer: true,
  user: true,
  cashRegister: true,
} satisfies Prisma.SaleInclude;

const STOCK_RESERVE_ERROR =
  "Stock insuficiente, otro cajero tiene reservado este producto";

/**
 * Orquesta el flujo de pago por QR con reserva de stock atómica e idempotencia.
 *
 * - Reserva (decrementa) stock al generar el QR para que un 2.º dispositivo no
 *   pueda generar otro QR sobre el mismo stock.
 * - Completa la venta una sola vez cuando Libélula confirma el pago.
 * - Libera (incrementa) el stock si el cajero cancela o cambia de método.
 */
export class QrCheckoutService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Valida el contexto, registra la deuda en Libélula y reserva el stock de
   * forma atómica creando la sesión QR. Si la reserva falla (stock insuficiente)
   * la transacción se revierte y no queda stock comprometido.
   */
  async generateQrCheckout(input: GenerateQrInput): Promise<GenerateQrResult> {
    const { customerId, userId, cashRegisterId, items, notes } = input;

    if (!items || items.length === 0) {
      throw HttpCustomErrors.badRequest(
        "Debe haber al menos un producto en la venta",
      );
    }

    const customer = await prismaClient.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw HttpCustomErrors.notFound("Cliente no encontrado");

    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!user) throw HttpCustomErrors.notFound("Usuario no encontrado");
    if (user.status !== "Activo") {
      throw HttpCustomErrors.badRequest("El usuario no está activo");
    }

    const cashRegister = await prismaClient.cashRegister.findUnique({
      where: { id: cashRegisterId },
    });
    if (!cashRegister) throw HttpCustomErrors.notFound("Caja no encontrada");
    if (cashRegister.status === "Cerrado") {
      throw HttpCustomErrors.badRequest(
        "No se puede registrar una venta en una caja cerrada",
      );
    }

    //? Cargar productos para armar snapshot, líneas de Libélula y total
    const reservedItems: ReservedItem[] = [];
    const libelulaItems: {
      concepto: string;
      cantidad: number;
      costo_unitario: number;
    }[] = [];
    let total = 0;

    for (const item of items) {
      const product = await prismaClient.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw HttpCustomErrors.notFound(
          `Producto con ID ${item.productId} no encontrado`,
        );
      }

      if (product.isVariableWeight) {
        if (!item.batchId) {
          throw HttpCustomErrors.badRequest(
            `El producto "${product.name}" es de peso variable y requiere seleccionar un lote`,
          );
        }
        const batch = await prismaClient.productBatch.findUnique({
          where: { id: item.batchId },
        });
        if (!batch) throw HttpCustomErrors.notFound("Lote no encontrado");
        if (batch.productId !== item.productId) {
          throw HttpCustomErrors.badRequest(
            "El lote no pertenece al producto seleccionado",
          );
        }
      }

      reservedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        batchId: item.batchId,
        isVariableWeight: product.isVariableWeight,
      });
      libelulaItems.push({
        concepto: product.name,
        cantidad: item.quantity,
        costo_unitario: item.unitPrice,
      });
      total += item.quantity * item.unitPrice;
    }

    //? Registrar la deuda en Libélula antes de reservar (el código es @unique)
    const libelula = await this.paymentRepository.registrarDeuda(
      libelulaItems,
      "ventas@coquito.com",
      `Venta total: ${total.toFixed(2)}`,
    );

    if (libelula?.error !== 0) {
      throw HttpCustomErrors.badRequest(
        libelula?.mensaje ||
          "No se pudo registrar la deuda en la pasarela de pagos",
      );
    }

    const codigoRecaudacion: string | undefined = libelula.codigo_recaudacion;
    if (!codigoRecaudacion) {
      throw HttpCustomErrors.internalServerError(
        "La pasarela de pagos no devolvió el código de recaudación",
      );
    }

    //? Reserva atómica de stock + creación de la sesión (todo o nada)
    await prismaClient.$transaction(async (tx) => {
      for (const item of reservedItems) {
        if (item.isVariableWeight && item.batchId) {
          const reserved = await tx.productBatch.updateMany({
            where: { id: item.batchId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (reserved.count === 0) {
            throw HttpCustomErrors.badRequest(STOCK_RESERVE_ERROR);
          }

          const batches = await tx.productBatch.findMany({
            where: { productId: item.productId },
          });
          const totalStock = batches.reduce((sum, b) => sum + b.stock, 0);
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: totalStock },
          });
        } else {
          const reserved = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (reserved.count === 0) {
            throw HttpCustomErrors.badRequest(STOCK_RESERVE_ERROR);
          }
        }
      }

      await tx.qrCheckoutSession.create({
        data: {
          codigoRecaudacion,
          idTransaccion: libelula.id_transaccion?.toString() ?? null,
          identificadorDeuda: libelula.identificador_deuda?.toString() ?? null,
          userId,
          customerId,
          cashRegisterId,
          items: reservedItems as unknown as Prisma.InputJsonValue,
          total,
          notes: notes ?? null,
          status: "Reservado",
        },
      });
    });

    return {
      qr_simple_url: libelula.qr_simple_url,
      id_transaccion: libelula.id_transaccion?.toString() ?? "",
      codigo_recaudacion: codigoRecaudacion,
      mensaje: libelula.mensaje,
    };
  }

  /**
   * Consulta el estado del pago en Libélula y, si está pagado y la sesión sigue
   * reservada, completa la venta de forma idempotente.
   */
  async getStatusAndComplete(
    codigoRecaudacion: string,
  ): Promise<QrStatusResult> {
    const session = await prismaClient.qrCheckoutSession.findUnique({
      where: { codigoRecaudacion },
    });

    //? Sin sesión: QR no gestionado por reserva → solo reportar estado Libélula
    if (!session) {
      const verificacion =
        await this.paymentRepository.verificarPago(codigoRecaudacion);
      return {
        pagado: verificacion.pagado,
        valor_total: verificacion.valorTotal,
        saleCompleted: false,
      };
    }

    const totalNumber = Number(session.total);

    //? Ya completada → idempotente, devolver la misma venta
    if (session.status === "Completado") {
      const sale = session.saleId
        ? await this.loadSale(session.saleId)
        : undefined;
      return {
        pagado: true,
        valor_total: totalNumber,
        saleCompleted: true,
        sale,
      };
    }

    //? Cancelada → la reserva ya se liberó, no se completa
    if (session.status === "Cancelado") {
      return { pagado: false, valor_total: totalNumber, saleCompleted: false };
    }

    //? Reservada → verificar pago contra Libélula
    const verificacion =
      await this.paymentRepository.verificarPago(codigoRecaudacion);

    if (!verificacion.pagado) {
      return {
        pagado: false,
        valor_total: verificacion.valorTotal,
        saleCompleted: false,
      };
    }

    //? Pago parcial → no completar la venta
    if (verificacion.valorTotal < totalNumber) {
      return {
        pagado: true,
        valor_total: verificacion.valorTotal,
        saleCompleted: false,
      };
    }

    const sale = await this.completeSale(session.id);
    return {
      pagado: true,
      valor_total: totalNumber,
      saleCompleted: true,
      sale,
    };
  }

  /**
   * Libera el stock reservado y marca la sesión como Cancelado.
   * Solo actúa si la sesión sigue en estado Reservado.
   */
  async cancelQrCheckout(
    codigoRecaudacion: string,
  ): Promise<{ released: boolean }> {
    const session = await prismaClient.qrCheckoutSession.findUnique({
      where: { codigoRecaudacion },
    });

    if (!session || session.status !== "Reservado") {
      return { released: false };
    }

    const items = session.items as unknown as ReservedItem[];

    await prismaClient.$transaction(async (tx) => {
      //? Idempotencia: solo libera quien gana la transición Reservado → Cancelado
      const claimed = await tx.qrCheckoutSession.updateMany({
        where: { id: session.id, status: "Reservado" },
        data: { status: "Cancelado" },
      });
      if (claimed.count === 0) return;

      for (const item of items) {
        if (item.isVariableWeight && item.batchId) {
          await tx.productBatch.update({
            where: { id: item.batchId },
            data: { stock: { increment: item.quantity } },
          });
          const batches = await tx.productBatch.findMany({
            where: { productId: item.productId },
          });
          const totalStock = batches.reduce((sum, b) => sum + b.stock, 0);
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: totalStock },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    return { released: true };
  }

  /**
   * Crea la venta a partir de una sesión reservada sin volver a decrementar
   * stock (ya reservado al generar el QR). Idempotente: si otro poll ya completó
   * la venta, devuelve la existente.
   */
  private async completeSale(sessionId: string): Promise<SaleEntity> {
    const newSale = await prismaClient.$transaction(async (tx) => {
      //? Idempotencia: solo un poll concurrente gana la transición
      const claimed = await tx.qrCheckoutSession.updateMany({
        where: { id: sessionId, status: "Reservado" },
        data: { status: "Completado" },
      });

      if (claimed.count === 0) {
        const current = await tx.qrCheckoutSession.findUnique({
          where: { id: sessionId },
        });
        if (current?.saleId) {
          return tx.sale.findUnique({
            where: { id: current.saleId },
            include: SALE_INCLUDE,
          });
        }
        return null;
      }

      const session = await tx.qrCheckoutSession.findUniqueOrThrow({
        where: { id: sessionId },
      });
      const items = session.items as unknown as ReservedItem[];
      const total = Number(session.total);

      const saleNumber = await this.generateSaleNumber(tx);

      const sale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: session.customerId,
          userId: session.userId,
          cashRegisterId: session.cashRegisterId,
          subtotal: total,
          tax: 0,
          total,
          paymentMethod: "QR",
          amountPaid: total,
          change: 0,
          status: "Completado",
          notes: session.notes ?? null,
          completedAt: new Date(),
        },
      });

      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice;

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: itemTotal,
          },
        });

        //? El stock ya fue reservado al generar el QR (no se vuelve a decrementar)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        const currentStock = product?.stock ?? 0;

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId: session.userId,
            type: "Venta",
            quantity: item.quantity,
            previousStock: currentStock + item.quantity,
            newStock: currentStock,
            reason: `Venta - Nota ${saleNumber}${
              item.isVariableWeight ? " (Batch)" : ""
            }`,
            reference: sale.id,
            notes: item.batchId ? `Pago QR, Lote: ${item.batchId}` : "Pago QR",
          },
        });
      }

      await tx.cashRegister.update({
        where: { id: session.cashRegisterId },
        data: {
          totalSales: { increment: total },
          totalOrders: { increment: 1 },
          qrSales: { increment: total },
        },
      });

      await tx.qrCheckoutSession.update({
        where: { id: session.id },
        data: { saleId: sale.id },
      });

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: SALE_INCLUDE,
      });
    });

    if (!newSale) {
      //? Otro poll completó la venta entre medias: recargar y devolver
      const fresh = await prismaClient.qrCheckoutSession.findUnique({
        where: { id: sessionId },
      });
      if (fresh?.saleId) {
        const sale = await this.loadSale(fresh.saleId);
        if (sale) return sale;
      }
      throw HttpCustomErrors.internalServerError(
        "Error al completar la venta QR",
      );
    }

    return SaleEntity.mapFromPrisma(newSale);
  }

  private async loadSale(saleId: string): Promise<SaleEntity | undefined> {
    const sale = await prismaClient.sale.findUnique({
      where: { id: saleId },
      include: SALE_INCLUDE,
    });
    return sale ? SaleEntity.mapFromPrisma(sale) : undefined;
  }

  /**
   * Genera un número de venta único con el formato SLE-YYYY-NNNN.
   */
  private async generateSaleNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `SLE-${currentYear}-`;

    const lastSale = await tx.sale.findFirst({
      where: { saleNumber: { startsWith: prefix } },
      orderBy: { createdAt: "desc" },
    });

    if (!lastSale) return `${prefix}0001`;

    const lastNumber = parseInt(lastSale.saleNumber.split("-")[2] || "0");
    const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
    return `${prefix}${nextNumber}`;
  }
}
