import { z as zod } from "zod";

export const createProductBatchSchema = zod.object({
  productId: zod.uuid({ error: "ID de producto inválido" }),
  
  weight: zod
    .number({ error: "Peso es requerido" })
    .positive({ error: "Peso debe ser mayor a 0" })
    .max(10, { error: "Peso máximo 10 kg" }),
  
  unitPrice: zod
    .number({ error: "Precio de unidad es requerido" })
    .positive({ error: "Precio debe ser mayor a 0" })
    .multipleOf(0.01, { error: "Precio debe tener máximo 2 decimales" }),
});

export type CreateProductBatchSchema = zod.infer<typeof createProductBatchSchema>;

