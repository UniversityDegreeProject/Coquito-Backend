import { z as zod } from "zod";

/**
 * Schema para buscar órdenes con filtros opcionales
 */
export const searchOrdersSchema = zod.object({
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

  // Paginación
  page: zod
    .number({ error: "Página debe ser un número" })
    .int({ error: "Página debe ser un número entero" })
    .min(1, { error: "La página debe ser al menos 1" })
    .default(1),
  
  limit: zod
    .number({ error: "Límite debe ser un número" })
    .int({ error: "Límite debe ser un número entero" })
    .min(1, { error: "El límite debe ser al menos 1" })
    .max(100, { error: "El límite no puede ser mayor a 100" })
    .default(10),
});

export type SearchOrdersSchema = zod.infer<typeof searchOrdersSchema>;

