import { Request, Response } from "express";
import { PaymentRepository } from "../../../domain";

export class PaymentController {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  // En el backend: payment.controller.ts
  public generateQr = async (req: Request, res: Response) => {
    try {
      const { amount, items } = req.body;

      // Log para depuración (mira tu consola del terminal)
      console.log("Datos recibidos para QR:", { amount, items });

      // Llamada al datasource/repository
      const result = await this.paymentRepository.registrarDeuda(
        items,
        "ventas@coquito.com",
        `Venta total: ${amount}`,
      );

      res.json({
        error: result.error !== 0,
        mensaje: result.mensaje,
        qr_simple_url: result.qr_simple_url,
        id_transaccion: result.id_transaccion,
        codigo_recaudacion: result.codigo_recaudacion, // 👈 Añade esto
      });
    } catch (error) {
      console.error("Error en generateQr:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  public checkStatus = (req: Request, res: Response) => {
    const { id } = req.params;

    // 1. Forzamos al navegador a no guardar esta respuesta en caché
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

    this.paymentRepository
      .consultarEstado(id as string)
      .then((result) => {
        // La respuesta de este servicio devuelve un objeto 'datos' [cite: 721]
        const info = result.datos;
        res.json({
          pagado: info.pagado, // El manual indica que es booleano [cite: 608]
          fecha_pago: info.fecha_pago,
        });
      })
      .catch((error) => {
        console.error("Error en repositorio:", error);
        res.status(500).json({ error: "Error al consultar estado" });
      });
  };
}
