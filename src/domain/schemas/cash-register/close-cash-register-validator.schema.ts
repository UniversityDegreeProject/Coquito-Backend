import { z as zod } from "zod";

/**
 * Schema para cerrar una caja (Cash Register)
 * Requiere el monto final contado físicamente
 */
export const closeCashRegisterSchema = zod.object({
  cashRegisterId: zod.uuid({ error: "ID de caja inválido" }),
  
  closingAmount: zod
    .number({ error: "Monto final es requerido" })
    .min(0, { error: "El monto final no puede ser negativo" })
    .multipleOf(0.01, { error: "El monto final debe tener máximo 2 decimales" }),
  
  notes: zod
    .string({ error: "Notas inválidas" })
    .max(500, { error: "Las notas deben tener máximo 500 caracteres" })
    .optional(),
});

export type CloseCashRegisterSchema = zod.infer<typeof closeCashRegisterSchema>;

