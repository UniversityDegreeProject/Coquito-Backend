import { z as zod } from "zod";

/**
 * Schema para obtener la caja activa actual de un usuario
 */
export const getCurrentCashRegisterSchema = zod.object({
  userId: zod.uuid({ error: "ID de usuario inválido" }),
});

export type GetCurrentCashRegisterSchema = zod.infer<typeof getCurrentCashRegisterSchema>;

