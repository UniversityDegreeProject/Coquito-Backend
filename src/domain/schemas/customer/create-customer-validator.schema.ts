import { z as zod } from "zod";

export const createCustomerSchema = zod.object({
  firstName: zod
    .string({ error: "Nombre es requerido" })
    .min(1, { error: "El nombre no puede estar vacío" })
    .regex(/^[A-Z][a-z]+(\s[A-Z][a-z]+)?$/, { error: "El nombre debe comenzar con letra mayúscula y no puede contener números" }),
  
  lastName: zod
    .string({ error: "Apellido es requerido" })
    .min(1, { error: "El apellido no puede estar vacío" })
    .regex(/^[A-Z][a-z]+(\s[A-Z][a-z]+)?$/, { error: "El apellido debe comenzar con letra mayúscula y no puede contener números" }),
  
  email: zod
    .email({ error: "Formato de email inválido" })
    .toLowerCase(),

  password: zod
    .string({ error: "Contraseña es requerida" })
    .min(6, { error: "La contraseña debe tener al menos 6 caracteres" })
    .max(16, { error: "La contraseña debe tener menos de 16 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      { 
        error: "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial" 
      }
    )
    .optional(),
  
  phone: zod
    .string({ error: "Teléfono inválido" })
    .refine(
      val =>
        (/^\d{8}$/.test(val)) ||
        (/^\+\d{11}$/.test(val)),
      {
        message: "Debe ingresar 8 números si es local o 11 números con el prefijo internacional"
      }
    ),
  
  address: zod
    .string({ error: "Dirección inválida" })
    .max(255, { error: "La dirección debe tener máximo 255 caracteres" })
    .optional(),
  
  type: zod
    .enum(["Regular", "VIP", "Ocasional"], { 
      error: "Tipo debe ser Regular, VIP u Ocasional" 
    })
    .default("Regular"),
});

export type CreateCustomerSchema = zod.infer<typeof createCustomerSchema>;

