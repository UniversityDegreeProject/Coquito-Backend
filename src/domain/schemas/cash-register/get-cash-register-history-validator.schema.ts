import { z as zod } from "zod";
import { paginationSchema } from "../shared/pagination.schema";

/**
 * Schema para obtener el historial de cierres de caja
 */
export const getCashRegisterHistorySchema = paginationSchema.extend({
  userId: zod.uuid({ error: "ID de usuario inválido" }).optional(),
  startDate: zod.coerce.date({ error: "Fecha de inicio inválida" }).optional(),
  endDate: zod.coerce.date({ error: "Fecha de fin inválida" }).optional(),
});

export type GetCashRegisterHistorySchema = zod.infer<typeof getCashRegisterHistorySchema>;

