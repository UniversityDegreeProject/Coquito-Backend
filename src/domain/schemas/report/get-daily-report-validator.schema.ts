import { z as zod } from "zod";

/**
 * Schema para obtener reporte diario
 * Mantiene la fecha como string para evitar problemas de zona horaria
 */
export const getDailyReportSchema = zod.object({
  date: zod.string({ error: "Fecha inválida" }).regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe tener el formato YYYY-MM-DD",
  }),
});

export type GetDailyReportSchema = zod.infer<typeof getDailyReportSchema>;

