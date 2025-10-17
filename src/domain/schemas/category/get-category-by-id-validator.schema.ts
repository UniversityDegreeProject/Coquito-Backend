import { z as zod } from "zod";

export const getCategoryByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type GetCategoryByIdSchema = zod.infer<typeof getCategoryByIdSchema>;

