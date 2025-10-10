import { z as zod } from "zod";

export const forgotPasswordSchema = zod.object({
  email: zod.email({ error: "Email inválido" }),
});

export type ForgotPasswordSchema = zod.infer<typeof forgotPasswordSchema>;