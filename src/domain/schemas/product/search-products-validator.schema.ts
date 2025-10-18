import { z as zod } from "zod";

export const searchProductsSchema = zod.object({
  search: zod.string().trim().optional(),
  categoryId: zod.uuid({ error: "ID de categoría inválido" }).optional(),
  status: zod.enum(["Disponible", "SinStock", "Descontinuado"], { error: "Estado inválido" }).optional(),
  lowStock: zod.string().optional().transform(val => val === 'true'),
  page: zod.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: zod.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export type SearchProductsSchema = zod.infer<typeof searchProductsSchema>;

