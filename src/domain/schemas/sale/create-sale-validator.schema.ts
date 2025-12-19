import { z as zod } from "zod";

/**
 * Schema para un item de la venta
 */
export const saleItemSchema = zod.object({
  productId: zod.uuid({ error: "ID de producto inválido" }),

  quantity: zod
    .number({ error: "Cantidad es requerida" })
    .int({ error: "La cantidad debe ser un número entero" })
    .min(1, { error: "La cantidad debe ser al menos 1" }),

  unitPrice: zod
    .number({ error: "Precio unitario es requerido" })
    .min(0, { error: "El precio unitario no puede ser negativo" })
    .multipleOf(0.01, { error: "El precio debe tener máximo 2 decimales" }),

  // Para productos de peso variable: ID del batch específico
  batchId: zod.uuid({ error: "ID de batch inválido" }).optional(),
});

/**
 * Schema para crear una venta
 */
export const createSaleSchema = zod
  .object({
    customerId: zod.uuid({ error: "ID de cliente inválido" }),

    userId: zod.uuid({ error: "ID de usuario inválido" }),

    cashRegisterId: zod.uuid({ error: "ID de caja inválido" }),

    items: zod
      .array(saleItemSchema, { error: "Items de la venta son requeridos" })
      .min(1, { error: "Debe haber al menos un producto en la venta" }),

    paymentMethod: zod.enum(["Efectivo", "Tarjeta", "QR"], {
      error: "Método de pago debe ser Efectivo, Tarjeta o QR",
    }),

    amountPaid: zod
      .number({ error: "Monto pagado es requerido" })
      .min(0, { error: "El monto pagado no puede ser negativo" })
      .multipleOf(0.01, { error: "El monto debe tener máximo 2 decimales" }),

    notes: zod
      .string({ error: "Notas inválidas" })
      .max(500, { error: "Las notas deben tener máximo 500 caracteres" })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Calcular el total de la venta
    const total = data.items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    // Validar que el monto pagado sea suficiente
    if (data.amountPaid < total) {
      ctx.addIssue({
        code: "custom",
        path: ["amountPaid"],
        message: `El monto pagado (${
          data.amountPaid
        } Bs) debe ser mayor o igual al total (${total.toFixed(2)} Bs)`,
      });
    }
  });

export type CreateSaleSchema = zod.infer<typeof createSaleSchema>;
export type SaleItemSchema = zod.infer<typeof saleItemSchema>;
