import { z as zod } from "zod";

export const createCategorySchema = zod.object({
  name: zod
    .string({ error: "Nombre es requerido" })
    .transform((val) => val.trim().replace(/\s+/g, " "))
    .pipe(
      zod
        .string()
        .min(1, { error: "El nombre no puede estar vacío" })
        .max(30, { error: "El nombre debe tener máximo 30 caracteres" })
        .regex(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/, {
          error: "La categoria debe contener solo letras",
        }),
    ),

  description: zod
    .string({ error: "Descripción inválida" })
    .max(255, { error: "La descripción debe tener máximo 255 caracteres" })
    .optional(),

  status: zod
    .enum(["Activo", "Inactivo"], {
      error: "Estado debe ser Activo o Inactivo",
    })
    .default("Activo"),
});

export type CreateCategorySchema = zod.infer<typeof createCategorySchema>;
