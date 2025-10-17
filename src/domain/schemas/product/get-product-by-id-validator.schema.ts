import { z as zod } from "zod";

export const getProductByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type GetProductByIdSchema = zod.infer<typeof getProductByIdSchema>;

