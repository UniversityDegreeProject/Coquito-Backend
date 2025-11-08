import { z as zod } from "zod";

export const updateBatchStockSchema = zod.object({
  batchId: zod.uuid({ error: "ID de batch inválido" }),
  
  stock: zod
    .number({ error: "Stock es requerido" })
    .int({ error: "Stock debe ser un número entero" })
    .min(0, { error: "Stock no puede ser negativo" }),
  
  userId: zod.uuid({ error: "ID de usuario inválido" }),
  
  reason: zod
    .string({ error: "Motivo inválido" })
    .optional()
    .default("Reasignación de batch"),
  
  notes: zod
    .string({ error: "Notas inválidas" })
    .optional(),
});

export type UpdateBatchStockSchema = zod.infer<typeof updateBatchStockSchema>;

