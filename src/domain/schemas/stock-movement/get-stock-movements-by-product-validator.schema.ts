import { z as zod } from "zod";

export const getStockMovementsByProductSchema = zod.object({
  productId: zod.uuid({ error: "ID de producto inválido" }),
  
  page: zod
    .number({ error: "Página debe ser un número" })
    .int({ error: "Página debe ser un número entero" })
    .positive({ error: "Página debe ser mayor a 0" })
    .default(1),
  
  limit: zod
    .number({ error: "Límite debe ser un número" })
    .int({ error: "Límite debe ser un número entero" })
    .positive({ error: "Límite debe ser mayor a 0" })
    .max(100, { error: "El límite máximo es 100" })
    .default(20),
});

export type GetStockMovementsByProductSchema = zod.infer<typeof getStockMovementsByProductSchema>;

