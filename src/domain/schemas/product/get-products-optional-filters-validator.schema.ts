import { z as zod } from "zod";


export const getProductsOptionalFiltersSchema = zod.object({
  search: zod.string()
    .trim()
    .optional(),
    
  categoryId: zod.uuid({ error: "ID de categoría inválido" })
    .optional(),

  status: zod.enum(["Disponible", "SinStock", "Descontinuado"], { error: "Estado inválido" })
    .optional(),

  minStock: zod.coerce.number({ error: "Stock bajo debe ser un número" })
    .int({ error: "Stock bajo debe ser un número entero" })
    .positive({ error: "Stock bajo debe ser mayor a 0" })
    .optional(),

  page: zod.coerce.number({ error: "Página inválida" })
    .int({ error: "Página debe ser un número entero" })
    .positive({ error: "Página debe ser mayor a 0" })
    .default(1),

  limit: zod.coerce.number({ error: "Límite inválido" })
    .int({ error: "Límite debe ser un número entero" })
    .positive({ error: "Límite debe ser mayor a 0" })
    .max(100, { error: "El límite máximo es 100" })
    .default(5),
})

export type GetProductsOptionalFiltersSchema = zod.infer<typeof getProductsOptionalFiltersSchema>;