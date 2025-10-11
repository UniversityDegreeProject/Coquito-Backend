import { z as zod } from "zod";

export const getUserByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type GetUserByIdSchema = zod.infer<typeof getUserByIdSchema>;
