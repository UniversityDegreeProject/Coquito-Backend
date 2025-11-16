import { z as zod } from "zod";

/**
 * Schema para obtener resumen de cierres de caja
 * Mantiene las fechas como strings para evitar problemas de zona horaria
 */
export const getCashRegisterSummarySchema = zod.object({
  startDate: zod.string({ error: "Fecha de inicio inválida" }).regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe tener el formato YYYY-MM-DD",
  }),
  endDate: zod.string({ error: "Fecha de fin inválida" }).regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe tener el formato YYYY-MM-DD",
  }),
}).refine((data) => {
  // Comparar strings de fecha directamente
  return data.endDate >= data.startDate;
}, {
  message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
  path: ["endDate"],
});

export type GetCashRegisterSummarySchema = zod.infer<typeof getCashRegisterSummarySchema>;

