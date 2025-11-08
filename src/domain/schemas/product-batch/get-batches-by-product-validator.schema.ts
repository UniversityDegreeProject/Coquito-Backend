import { z as zod } from "zod";

export const getBatchesByProductSchema = zod.object({
  productId: zod.uuid({ error: "ID de producto inválido" }),
});

export type GetBatchesByProductSchema = zod.infer<typeof getBatchesByProductSchema>;

