import { z as zod } from "zod";

export const deleteProductByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type DeleteProductByIdSchema = zod.infer<typeof deleteProductByIdSchema>;

