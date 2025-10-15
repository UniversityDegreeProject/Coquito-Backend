import { z as zod } from "zod"

export const updateUserSchema = zod.object({
  id: zod
    .uuid("Id inválido"),

  username: zod
    .string()
    .trim()
    .min(1, "Usuario no puede estar vacio")
    .toLowerCase(),

  email: zod
    .email("Email inválido")
    .toLowerCase(),

  emailVerified: zod
    .boolean(),
  
  firstName: zod
    .string()
    .trim()
    .min(1, "Nombre no puede estar vacio")
    .regex(/^[A-Z][a-z]+$/, { error: "El nombre debe comenzar con letra mayúscula y no puede contener numeros" }),

  lastName: zod
    .string()
    .trim()
    .min(1, "Apellido no puede estar vacio")
    .regex(/^[A-Z][a-z]+$/, { error: "El apellido debe comenzar con letra mayúscula y no puede contener numeros" }),

  role: zod
    .enum(["Administrador", "Cajero"], { error: "Rol inválido" }),

  status: zod
    .enum(["Activo", "Inactivo", "Suspendido"], { error: "Estado inválido" }),

  phone: zod
    .string()
    .trim()
    .min(1, "Teléfono no puede estar vacio")
    .regex(/^[0-9]+$/, { error: "El teléfono debe contener solo numeros" })
    .optional(),

  password: zod
    .string()
    .trim()
    .min(1, "Contraseña no puede estar vacio")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      { error: "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial" }
    )
    .optional(),

  updatedAt: zod
    .date()
    .optional(),
});

export type UpdateUserSchema = zod.infer<typeof updateUserSchema>;