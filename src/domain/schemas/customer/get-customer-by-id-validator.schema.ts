import { z as zod } from "zod";

export const getCustomerByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type GetCustomerByIdSchema = zod.infer<typeof getCustomerByIdSchema>;

