import { Request, Response } from "express";
import { HttpCustomErrors } from "../../../domain";
import { QrCheckoutService } from "../../../domain/services/qr-checkout.service";
import { SocketService } from "../../socket/socket.service";

export class PaymentController {
  constructor(private readonly qrCheckoutService: QrCheckoutService) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Error interno en pagos QR:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  };

  /**
   * POST /api/payments/generate-qr
   * Recibe el payload completo de la venta, reserva el stock de forma atómica,
   * registra la deuda en Libélula y crea la sesión QR.
   */
  public generateQr = async (req: Request, res: Response) => {
    const { customerId, userId, cashRegisterId, items, notes } = req.body;

    try {
      const result = await this.qrCheckoutService.generateQrCheckout({
        customerId,
        userId,
        cashRegisterId,
        items,
        notes,
      });

      return res.json({
        error: false,
        mensaje: result.mensaje,
        qr_simple_url: result.qr_simple_url,
        id_transaccion: result.id_transaccion,
        codigo_recaudacion: result.codigo_recaudacion,
      });
    } catch (error) {
      return this.handleHttpStatusError(error, res);
    }
  };

  /**
   * GET /api/payments/status/:id
   * Consulta el estado del pago. Si Libélula confirma el pago y la sesión sigue
   * reservada, completa la venta en el backend (idempotente).
   */
  public checkStatus = async (req: Request, res: Response) => {
    const { id } = req.params;

    //? Evitar que el navegador cachee el estado del pago
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

    try {
      const result = await this.qrCheckoutService.getStatusAndComplete(
        id as string,
      );

      //? Emitir eventos en tiempo real al completar la venta QR
      if (result.saleCompleted && result.sale) {
        SocketService.emit("sale:created", { sale: result.sale });

        const uniqueProductIds = [
          ...new Set(
            (result.sale.items ?? []).map((item) => item.productId),
          ),
        ];
        for (const productId of uniqueProductIds) {
          SocketService.emit("product:updated", { productId });
        }
      }

      return res.json({
        pagado: result.pagado,
        valor_total: result.valor_total,
        saleCompleted: result.saleCompleted,
        sale: result.sale ?? null,
      });
    } catch (error) {
      return this.handleHttpStatusError(error, res);
    }
  };

  /**
   * POST /api/payments/cancel-qr
   * Libera el stock reservado y marca la sesión como cancelada. Lo usa el
   * frontend al cerrar el modal o al cambiar de QR a otro método de pago.
   */
  public cancelQr = async (req: Request, res: Response) => {
    const { codigoRecaudacion } = req.body;

    if (!codigoRecaudacion) {
      return res
        .status(400)
        .json({ error: "El código de recaudación es requerido" });
    }

    try {
      const result =
        await this.qrCheckoutService.cancelQrCheckout(codigoRecaudacion);
      return res.json(result);
    } catch (error) {
      return this.handleHttpStatusError(error, res);
    }
  };
}
