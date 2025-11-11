import { z as zod } from "zod";

/**
 * Schema para obtener una orden por ID
 */
export const getOrderByIdSchema = zod.object({
  orderId: zod.uuid({ error: "ID de orden inválido" }),
});

export type GetOrderByIdSchema = zod.infer<typeof getOrderByIdSchema>;

