import { z as zod } from "zod";
import { paginationSchema } from "../shared/pagination.schema";

/**
 * Schema para obtener ventas con filtros opcionales
 */
export const getSalesOptionalFiltersSchema = paginationSchema.extend({
  // Filtros
  userId: zod.uuid({ error: "ID de usuario inválido" }).optional(),
  customerId: zod.uuid({ error: "ID de cliente inválido" }).optional(),
  cashRegisterId: zod.uuid({ error: "ID de caja inválido" }).optional(),
  status: zod
    .enum(["Pendiente", "Completado", "Cancelado", "Reembolsado"], {
      error: "Estado debe ser Pendiente, Completado, Cancelado o Reembolsado",
    })
    .optional(),
  paymentMethod: zod
    .enum(["Efectivo", "Tarjeta", "QR"], {
      error: "Método de pago debe ser Efectivo, Tarjeta o QR",
    })
    .optional(),

  // Filtros de fecha
  startDate: zod.coerce.date({ error: "Fecha de inicio inválida" }).optional(),
  endDate: zod.coerce.date({ error: "Fecha de fin inválida" }).optional(),

  // Búsqueda textual
  search: zod.string().optional(),
});

export type GetSalesOptionalFiltersSchema = zod.infer<
  typeof getSalesOptionalFiltersSchema
>;
