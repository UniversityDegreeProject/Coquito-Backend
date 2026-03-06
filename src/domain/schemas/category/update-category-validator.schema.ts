import { z as zod } from "zod";

export const updateCategorySchema = zod.object({
  id: zod.uuid({ error: "Id inválido" }),

  name: zod
    .string({ error: "Nombre inválido" })
    .transform((val) => val.trim().replace(/\s+/g, " "))
    .pipe(
      zod
        .string()
        .min(1, { error: "El nombre no puede estar vacío" })
        .max(30, { error: "El nombre debe tener máximo 30 caracteres" })
        .regex(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/, {
          error: "La categoria debe contener solo letras, acentos y espacios",
        }),
    )
    .optional(),

  description: zod
    .string({ error: "Descripción inválida" })
    .max(255, { error: "La descripción debe tener máximo 255 caracteres" })
    .nullable()
    .optional(),

  status: zod
    .enum(["Activo", "Inactivo"], {
      error: "Estado debe ser Activo o Inactivo",
    })
    .optional(),

  updatedAt: zod.date({ error: "Fecha de actualización inválida" }).optional(),
});

export type UpdateCategorySchema = zod.infer<typeof updateCategorySchema>;
