import { z as zod } from "zod";

export const searchStockMovementsSchema = zod.object({
  productId: zod.uuid({ error: "ID de producto inválido" }).optional(),
  
  userId: zod.uuid({ error: "ID de usuario inválido" }).optional(),
  
  type: zod
    .enum(["Reabastecimiento", "Compra", "Venta", "Ajuste", "Devolucion", "Dañado"], {
      error: "Tipo de movimiento inválido",
    })
    .optional(),
  
  startDate: zod
    .string({ error: "Fecha de inicio inválida" })
    .datetime({ error: "Formato de fecha inválido. Use ISO 8601" })
    .optional(),
  
  endDate: zod
    .string({ error: "Fecha de fin inválida" })
    .datetime({ error: "Formato de fecha inválido. Use ISO 8601" })
    .optional(),
  
  page: zod
    .number({ error: "Página debe ser un número" })
    .int({ error: "Página debe ser un número entero" })
    .positive({ error: "Página debe ser mayor a 0" })
    .default(1),
  
  limit: zod
    .number({ error: "Límite debe ser un número" })
    .int({ error: "Límite debe ser un número entero" })
    .positive({ error: "Límite debe ser mayor a 0" })
    .max(100, { error: "El límite máximo es 100" })
    .default(10),
});

export type SearchStockMovementsSchema = zod.infer<typeof searchStockMovementsSchema>;

