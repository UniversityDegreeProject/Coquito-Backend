import { z as zod } from "zod";

/**
 * Schema para obtener reporte de productos
 * Mantiene las fechas como strings para evitar problemas de zona horaria
 */
export const getProductsReportSchema = zod.object({
  startDate: zod.string({ error: "Fecha de inicio inválida" }).regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe tener el formato YYYY-MM-DD",
  }),
  endDate: zod.string({ error: "Fecha de fin inválida" }).regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe tener el formato YYYY-MM-DD",
  }),
  limit: zod.coerce
    .number({ error: "El parámetro límite debe ser un número" })
    .int()
    .positive({ error: "El parámetro límite debe ser mayor a 0" })
    .default(10),
}).refine((data) => {
  // Comparar strings de fecha directamente
  return data.endDate >= data.startDate;
}, {
  message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
  path: ["endDate"],
});

export type GetProductsReportSchema = zod.infer<typeof getProductsReportSchema>;

