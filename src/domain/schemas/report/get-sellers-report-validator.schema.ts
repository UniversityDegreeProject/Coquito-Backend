import { z as zod } from "zod";

/**
 * Schema para obtener reporte de vendedores
 */
export const getSellersReportSchema = zod.object({
  startDate: zod.string({ error: "Fecha de inicio es requerida" }),
  endDate: zod.string({ error: "Fecha de fin es requerida" }),
  limit: zod.coerce.number().optional().default(10),
});

export type GetSellersReportSchema = zod.infer<typeof getSellersReportSchema>;
