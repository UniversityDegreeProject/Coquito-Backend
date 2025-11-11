import { z as zod } from "zod";

/**
 * Schema para abrir una caja (Cash Register)
 * Solo requiere el monto inicial con el que se abre la caja
 */
export const openCashRegisterSchema = zod.object({
  userId: zod.uuid({ error: "ID de usuario inválido" }),
  
  openingAmount: zod
    .number({ error: "Monto inicial es requerido" })
    .min(0, { error: "El monto inicial no puede ser negativo" })
    .multipleOf(0.01, { error: "El monto inicial debe tener máximo 2 decimales" }),
});

export type OpenCashRegisterSchema = zod.infer<typeof openCashRegisterSchema>;

