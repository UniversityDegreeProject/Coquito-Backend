import { z as zod } from "zod";

export const createStockMovementSchema = zod.object({
  productId: zod.uuid({ error: "ID de producto inválido" }),
  
  userId: zod.uuid({ error: "ID de usuario inválido" }),
  
  type: zod.enum(
    ["Reabastecimiento", "Compra", "Venta", "Ajuste", "Devolucion", "Dañado"],
    { error: "Tipo de movimiento inválido. Debe ser: Reabastecimiento, Compra, Venta, Ajuste, Devolucion o Dañado" }
  ),
  
  quantity: zod
    .number({ error: "Cantidad es requerida" })
    .int({ error: "Cantidad debe ser un número entero" })
    .refine(
      (val) => val !== 0,
      { error: "La cantidad no puede ser cero" }
    ),
  
  reason: zod
    .string({ error: "Razón inválida" })
    .min(1, { error: "La razón no puede estar vacía" })
    .max(500, { error: "La razón debe tener máximo 500 caracteres" })
    .optional(),
  
  reference: zod
    .string({ error: "Referencia inválida" })
    .min(1, { error: "La referencia no puede estar vacía" })
    .max(100, { error: "La referencia debe tener máximo 100 caracteres" })
    .optional(),
  
  notes: zod
    .string({ error: "Notas inválidas" })
    .max(1000, { error: "Las notas deben tener máximo 1000 caracteres" })
    .optional(),
});

export type CreateStockMovementSchema = zod.infer<typeof createStockMovementSchema>;

