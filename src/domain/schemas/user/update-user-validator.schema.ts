import { z as zod } from "zod"


export const updateUserSchema = zod.object({
  id: zod.uuid("Id inválido"),
  
  username: zod.string().trim().min(1, "Usuario no puede estar vacio").optional(),
  email: zod.email("Email inválido").optional(),
  emailVerified: zod.boolean().optional(),
  firstName: zod.string().trim().min(1, "Nombre no puede estar vacio").optional(),
  lastName: zod.string().trim().min(1, "Apellido no puede estar vacio").optional(),
  role: zod.enum(["Administrador", "Cajero"], { message: "Rol inválido" }).optional(),
  status: zod.enum(["Activo", "Inactivo", "Suspendido"], { message: "Estado inválido" }).optional(),
  phone: zod.string().trim().min(1, "Teléfono no puede estar vacio").optional(),
  password: zod.string().trim().min(1, "Contraseña no puede estar vacio").optional(),
  updatedAt: zod.date().optional(),
});

export type UpdateUserSchema = zod.infer<typeof updateUserSchema>;