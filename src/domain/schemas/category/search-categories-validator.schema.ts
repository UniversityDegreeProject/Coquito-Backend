import { z as zod } from "zod";

export const searchCategoriesSchema = zod.object({
  search: zod.string().trim().optional(),
  status: zod.enum(["Activo", "Inactivo"], { error: "Estado inválido" }).optional(),
  page: zod.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: zod.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export type SearchCategoriesSchema = zod.infer<typeof searchCategoriesSchema>;

