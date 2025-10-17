import { z as zod } from "zod";

export const createUserSchema = zod.object({
  username: zod
    .string({ error: "Usuario es requerido" })
    .min(3, { error: "El usuario debe tener al menos 3 caracteres" })
    .max(20, { error: "El usuario debe tener máximo 20 caracteres" })
    .toLowerCase(),
  email: zod
    .email({ error: "Formato de email invalido" })
    .min(1, { error: "El email no puede estar vacio" })
    .toLowerCase(),

  password: zod
    .string({ error: "Contraseña es requerida" })
    .min(6, { error: "Contraseña debe tener al menos 6 caracteres" })
    .max(16, { error: "Contraseña debe estar entre 6 y 16 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      { 
        error: "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial" 
      }
    )
    .optional(),
  firstName: zod
    .string({ error: "Nombre es requerido" })
    .min(1, { error: "El nombre no puede estar vacio" })
    .regex(/^[A-Z][a-z]+$/, { error: "El nombre debe comenzar con letra mayúscula y no puede contener numeros" }),
  
  lastName: zod
    .string({ error: "Apellido es requerido" })
    .min(1, { error: "El apellido no puede estar vacio" })
    .regex(/^[A-Z][a-z]+$/, { error: "El apellido debe comenzar con letra mayúscula y no puede contener numeros" }),
  
  phone: zod
  .string({ error: "Teléfono es requerido" })
  .refine(
    val =>
      (/^\d{8}$/.test(val)) ||
      (/^\+\d{11}$/.test(val)),
    {
      message:
        "Debe ingresar 8 números si es local o 11 números con el prefijo internacional ",
    }
  ),
  
  role: zod.enum(["Administrador", "Cajero"], { 
    error: "Rol es requerido" 
  }),
  
  status: zod
    .enum(["Activo", "Inactivo", "Suspendido"], { 
      error: "Estado es requerido" 
    })
    .default("Activo"),
});

export type RegisterUserSchema = zod.infer<typeof createUserSchema>;