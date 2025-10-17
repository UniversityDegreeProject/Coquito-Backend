import { z as zod } from "zod";

export const searchCustomersSchema = zod.object({
  search: zod.string().trim().optional(),
  type: zod.enum(["Regular", "VIP", "Ocasional"], { error: "Tipo inválido" }).optional(),
  page: zod.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: zod.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export type SearchCustomersSchema = zod.infer<typeof searchCustomersSchema>;

