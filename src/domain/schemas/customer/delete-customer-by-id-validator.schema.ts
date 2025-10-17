import { z as zod } from "zod";

export const deleteCustomerByIdSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
});

export type DeleteCustomerByIdSchema = zod.infer<typeof deleteCustomerByIdSchema>;

