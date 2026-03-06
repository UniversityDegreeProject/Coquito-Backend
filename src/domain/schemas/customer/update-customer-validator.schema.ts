import { z as zod } from "zod";

export const updateCustomerSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),

  firstName: zod
    .string({ error: "Nombre inválido" })
    .min(1, { error: "El nombre no puede estar vacío" })
    .regex(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/, {
      error:
        "El nombre debe comenzar con mayúscula, solo letras y sin espacios al inicio/final",
    })
    .optional(),

  lastName: zod
    .string({ error: "Apellido inválido" })
    .min(1, { error: "El apellido no puede estar vacío" })
    .regex(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/, {
      error:
        "El apellido debe comenzar con mayúscula, solo letras y sin espacios al inicio/final",
    })
    .optional(),

  email: zod
    .email({ error: "Formato de email inválido" })
    .toLowerCase()
    .optional(),

  phone: zod
    .string({ error: "Teléfono inválido" })
    .refine((val) => /^\d{8}$/.test(val) || /^\+\d{11}$/.test(val), {
      message:
        "Debe ingresar 8 números si es local o 11 números con el prefijo internacional",
    })
    .optional(),

  address: zod
    .string({ error: "Dirección inválida" })
    .max(255, { error: "La dirección debe tener máximo 255 caracteres" })
    .optional(),

  password: zod
    .string({ error: "Contraseña inválida" })
    .min(6, { error: "Contraseña debe tener al menos 6 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      {
        error:
          "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial",
      },
    )
    .max(16, { error: "Contraseña debe estar entre 6 y 16 caracteres" })
    .optional(),

  type: zod
    .enum(["Regular", "VIP", "Ocasional"], {
      error: "Tipo debe ser Regular, VIP u Ocasional",
    })
    .optional(),

  updatedAt: zod.date({ error: "Fecha de actualización inválida" }).optional(),
});

export type UpdateCustomerSchema = zod.infer<typeof updateCustomerSchema>;
