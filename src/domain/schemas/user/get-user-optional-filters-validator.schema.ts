import { z as zod } from "zod";

export const getUserOptionalFiltersSchema = zod.object({
  search: zod.string().trim().optional(),

  role: zod
    .enum(["Administrador", "Vendedor"], { error: "Rol inválido" })
    .optional(),

  status: zod
    .enum(["Activo", "Inactivo", "Suspendido"], { error: "Estado inválido" })
    .optional(),

  page: zod.coerce
    .number({ error: "Página inválida" })
    .int({ error: "Página debe ser un número entero" })
    .positive({ error: "Página debe ser mayor a 0" })
    .default(1),

  limit: zod.coerce
    .number({ error: "Límite inválido" })
    .int({ error: "Límite debe ser un número entero" })
    .positive({ error: "Límite debe ser mayor a 0" })
    .default(10),
});

export type GetUserOptionalFiltersSchema = zod.infer<
  typeof getUserOptionalFiltersSchema
>;
