import { z as zod } from "zod";

export const getStockMovementByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type GetStockMovementByIdSchema = zod.infer<typeof getStockMovementByIdSchema>;

