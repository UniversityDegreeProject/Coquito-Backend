import { z as zod } from "zod";



export const customerOptionalFiltersSchema = zod.object({
  search: zod.string()
  .trim()
  .optional(),

  type: zod.enum(["Regular", "VIP", "Ocasional"], { error: "Tipo inválido" })
  .optional(),

  page : zod.coerce.number({ error: "Página inválida" })
  .int({ error: "Página debe ser un número entero" })
  .positive({ error: "Página debe ser mayor a 0" })
  .default(1),

  limit : zod.coerce.number({ error: "Límite inválido" })
  .int({ error: "Límite debe ser un número entero" })
  .positive({ error: "Límite debe ser mayor a 0" })
  .default(10),
});


export type CustomerOptionalFiltersSchema = zod.infer<typeof customerOptionalFiltersSchema>;