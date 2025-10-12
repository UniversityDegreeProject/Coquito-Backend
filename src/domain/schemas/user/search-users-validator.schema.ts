import { z as zod } from "zod";

export const searchUsersSchema = zod.object({
  search: zod.string().trim().optional(), 
  role: zod.enum(["Administrador", "Cajero"], { error: "Rol inválido" }).optional(),
  status: zod.enum(["Activo", "Inactivo", "Suspendido"], { error: "Estado inválido" }).optional(),
  page: zod.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: zod.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export type SearchUsersSchema = zod.infer<typeof searchUsersSchema>;

