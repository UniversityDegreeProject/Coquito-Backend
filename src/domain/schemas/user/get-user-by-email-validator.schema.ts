import { z as zod } from "zod";

export const getUserByEmailSchema = zod.object({
  email: zod.email({ error: "Email inválido" }),
});

export type GetUserByEmailSchema = zod.infer<typeof getUserByEmailSchema>;
