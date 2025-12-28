import { z as zod } from "zod";

export const updateUserSchema = zod.object({
  id: zod.uuid("Id inválido"),

  username: zod
    .string()
    .trim()
    .min(1, "Usuario no puede estar vacio")
    .toLowerCase(),

  email: zod.email("Email inválido").toLowerCase(),

  emailVerified: zod.boolean(),

  firstName: zod
    .string({ error: "Nombre es requerido" })
    .min(1, { error: "El nombre no puede estar vacio" })
    .regex(/^[A-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      error:
        "El nombre debe comenzar con letra mayúscula y solo puede contener letras",
    }),

  lastName: zod
    .string({ error: "Apellido es requerido" })
    .min(1, { error: "El apellido no puede estar vacio" })
    .regex(/^[A-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      error:
        "El apellido debe comenzar con letra mayúscula y solo puede contener letras",
    }),

  role: zod.enum(["Administrador", "Vendedor"], { error: "Rol inválido" }),

  status: zod.enum(["Activo", "Inactivo", "Suspendido"], {
    error: "Estado inválido",
  }),

  phone: zod
    .string({ error: "Teléfono es requerido" })
    .refine((val) => /^\d{8}$/.test(val) || /^\+\d{11}$/.test(val), {
      message:
        "Debe ingresar 8 números si es local o 11 números con el prefijo internacional, usando '+', ejemplo: +595981234567",
    }),

  password: zod
    .string()
    .trim()
    .min(1, "Contraseña no puede estar vacio")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      {
        error:
          "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial",
      }
    )
    .optional(),

  updatedAt: zod.date().optional(),
});

export type UpdateUserSchema = zod.infer<typeof updateUserSchema>;
