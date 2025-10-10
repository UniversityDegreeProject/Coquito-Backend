import { z as zod } from "zod";

export const resetPasswordSchema = zod.object({
  token: zod.jwt(),
  newPassword: zod
    .string({ error: "Nueva contraseña es requerida" })
    .min(6, { error: "Contraseña debe tener al menos 6 caracteres" })
    .max(16, { error: "Contraseña debe tener máximo 16 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      { 
        error: "Contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número y un caracter especial" 
      }
    ),
});

export type ResetPasswordSchema = zod.infer<typeof resetPasswordSchema>;