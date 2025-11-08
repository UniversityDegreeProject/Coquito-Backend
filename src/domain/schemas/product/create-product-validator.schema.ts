import { z as zod } from "zod";

export const createProductSchema = zod.object({
  name: zod
    .string({ error: "Nombre es requerido" })
    .min(1, { error: "El nombre no puede estar vacío" })
    .max(100, { error: "El nombre debe tener máximo 100 caracteres" }),
  
  description: zod
    .string({ error: "Descripción inválida" })
    .max(500, { error: "La descripción debe tener máximo 500 caracteres" })
    .optional(),
  
  price: zod
    .number({ error: "Precio es requerido" })
    .min(0, { error: "El precio no puede ser negativo" })
    .multipleOf(0.01, { error: "El precio debe tener máximo 2 decimales" }),
  
  sku: zod
    .string({ error: "SKU inválido" })
    .max(50, { error: "El SKU debe tener máximo 50 caracteres" }),
  
  stock: zod
    .number({ error: "Stock debe ser un número" })
    .int({ error: "Stock debe ser un número entero" })
    .min(0, { error: "Stock no puede ser negativo" })
    .default(0),
  
  minStock: zod
    .number({ error: "Stock mínimo debe ser un número" })
    .int({ error: "Stock mínimo debe ser un número entero" })
    .min(0, { error: "Stock mínimo no puede ser negativo" })
    .default(5),
  
  image: zod
    .url({ error: "URL de imagen inválida" }),
  
  ingredients: zod
    .string({ error: "Ingredientes inválidos" })
    .max(1000, { error: "Los ingredientes deben tener máximo 1000 caracteres" })
    .optional(),
  
  categoryId: zod.uuid({ error: "ID de categoría inválido" }),
  
  status: zod
    .enum(["Disponible", "SinStock", "Descontinuado"], { 
      error: "Estado debe ser Disponible, SinStock o Descontinuado" 
    })
    .default("Disponible"),
  
  isVariableWeight: zod
    .boolean({ error: "isVariableWeight debe ser un booleano" })
    .default(false),
  
  pricePerKg: zod
    .number({ error: "Precio por kg inválido" })
    .positive({ error: "Precio por kg debe ser mayor a 0" })
    .multipleOf(0.01, { error: "Precio por kg debe tener máximo 2 decimales" })
    .optional(),
}).superRefine((data, ctx) => {
  // Validación condicional: si ES peso variable
  if (data.isVariableWeight) {
    // pricePerKg es requerido
    if (!data.pricePerKg || data.pricePerKg <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["pricePerKg"],
        message: "El precio por kg es requerido para productos de peso variable",
      });
    }
    // price debe ser 0
    if (data.price !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "El precio debe ser 0 para productos de peso variable",
      });
    }
    // stock debe ser 0
    if (data.stock !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["stock"],
        message: "El stock debe ser 0 para productos de peso variable",
      });
    }
  }
  
  // Validación condicional: si NO es peso variable
  if (!data.isVariableWeight) {
    // price debe ser mayor a 0
    if (data.price <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "El precio debe ser mayor a 0",
      });
    }
  }
});

export type CreateProductSchema = zod.infer<typeof createProductSchema>;

