import { z } from "zod";

/**
 * Schema de validación para el endpoint de refresh token
 * Valida que el refreshToken sea una cadena no vacía
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token es requerido" })
    .min(1, { error: "Refresh token no puede estar vacío" }),
});

export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;

