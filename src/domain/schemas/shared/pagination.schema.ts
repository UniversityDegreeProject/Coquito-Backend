import { z as zod } from "zod";


export const paginationSchema = zod.object({
  page : zod.coerce
  .number({ error: "El parametro de la pagina debe ser un numero" })
  .int()
  .positive({ error: "El parametro de la pagina debe ser mayor a 0" })
  .default(1),
  limit : zod.coerce
  .number({ error: "El parametro limite debe ser un numero" })
  .int()
  .positive({ error: "El parametro limite debe ser mayor a 0" })
  .default(7),
});

export type PaginationSchema = zod.infer<typeof paginationSchema>;