import { z as zod } from "zod";

/**
 * Schema para obtener una venta por ID
 */
export const getSaleByIdSchema = zod.object({
  saleId: zod.uuid({ error: "ID de venta inválido" }),
});

export type GetSaleByIdSchema = zod.infer<typeof getSaleByIdSchema>;
