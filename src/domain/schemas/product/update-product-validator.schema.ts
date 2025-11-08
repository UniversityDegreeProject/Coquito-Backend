import { z as zod } from "zod";

export const updateProductSchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),
  
  name: zod
    .string({ error: "Nombre inválido" })
    .min(1, { error: "El nombre no puede estar vacío" })
    .max(100, { error: "El nombre debe tener máximo 100 caracteres" })
    .optional(),
  
  description: zod
    .string({ error: "Descripción inválida" })
    .max(500, { error: "La descripción debe tener máximo 500 caracteres" })
    .nullable()
    .optional(),
  
  price: zod
    .number({ error: "Precio inválido" })
    .min(0, { error: "El precio no puede ser negativo" })
    .multipleOf(0.01, { error: "El precio debe tener máximo 2 decimales" })
    .optional(),
  
  sku: zod
    .string({ error: "SKU inválido" })
    .max(50, { error: "El SKU debe tener máximo 50 caracteres" })
    .nullable()
    .optional(),
  
  stock: zod
    .number({ error: "Stock inválido" })
    .int({ error: "Stock debe ser un número entero" })
    .min(0, { error: "Stock no puede ser negativo" })
    .optional(),
  
  minStock: zod
    .number({ error: "Stock mínimo inválido" })
    .int({ error: "Stock mínimo debe ser un número entero" })
    .min(0, { error: "Stock mínimo no puede ser negativo" })
    .optional(),
  
  image: zod
    .string({ error: "URL de imagen inválida" })
    .url({ error: "Debe ser una URL válida" })
    .nullable()
    .optional(),
  
  ingredients: zod
    .string({ error: "Ingredientes inválidos" })
    .max(1000, { error: "Los ingredientes deben tener máximo 1000 caracteres" })
    .nullable()
    .optional(),
  
  categoryId: zod.uuid({ error: "ID de categoría inválido" }).optional(),
  
  status: zod
    .enum(["Disponible", "SinStock", "Descontinuado"], { 
      error: "Estado debe ser Disponible, SinStock o Descontinuado" 
    })
    .optional(),
  
  isVariableWeight: zod
    .boolean({ error: "isVariableWeight debe ser un booleano" })
    .optional(),
  
  pricePerKg: zod
    .number({ error: "Precio por kg inválido" })
    .positive({ error: "Precio por kg debe ser mayor a 0" })
    .multipleOf(0.01, { error: "Precio por kg debe tener máximo 2 decimales" })
    .nullable()
    .optional(),
  
  updatedAt: zod
    .date({ error: "Fecha de actualización inválida" })
    .optional(),
});

export type UpdateProductSchema = zod.infer<typeof updateProductSchema>;

