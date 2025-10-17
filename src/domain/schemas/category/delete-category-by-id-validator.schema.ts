import { z as zod } from "zod";

export const deleteCategoryByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type DeleteCategoryByIdSchema = zod.infer<typeof deleteCategoryByIdSchema>;

