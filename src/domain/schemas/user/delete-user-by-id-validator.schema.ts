import { z as zod } from "zod";

export const deleteUserByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type DeleteUserByIdSchema = zod.infer<typeof deleteUserByIdSchema>;  