import { z as zod } from "zod";

export const createUserSchema = zod.object({
  username: zod
    .string({ error: "Usuario es requerido" })
    .min(3, { error: "El usuario debe tener al menos 3 caracteres" })
    .max(20, { error: "El usuario debe tener máximo 20 caracteres" }),

  email: zod
    .string({ error: "Email es requerido" })
    .min(1, { error: "El email no puede estar vacio" })
    .email({ error: "Formato de email invalido" }),
  
  password: zod
    .string({ error: "Contraseña es requerida" })
    .min(6, { error: "Contraseña debe tener al menos 6 caracteres" })
    .max(16, { error: "Contraseña debe estar entre 6 y 16 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      { 
        error: "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial" 
      }
    ),
  
  firstName: zod
    .string({ error: "Nombre es requerido" })
    .min(1, { error: "El nombre no puede estar vacio" }),
  
  lastName: zod
    .string({ error: "Apellido es requerido" })
    .min(1, { error: "El apellido no puede estar vacio" }),
  
  phone: zod
    .string({ error: "Teléfono es requerido" })
    .min(1, { error: "El teléfono no puede estar vacio" }),
  
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