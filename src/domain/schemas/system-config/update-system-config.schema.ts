import { z as zod } from "zod";

export const systemConfigItemSchema = zod.object({
  key: zod
    .string({ error: "La clave de configuración es requerida" })
    .min(1, { error: "La clave de configuración no puede estar vacía" })
    .max(100, {
      error: "La clave de configuración debe tener máximo 100 caracteres",
    }),
  value: zod
    .string({ error: "El valor de configuración es requerido" })
    .min(1, { error: "El valor de configuración no puede estar vacío" }),
  description: zod
    .string({ error: "Descripción inválida" })
    .max(255, { error: "La descripción debe tener máximo 255 caracteres" })
    .optional(),
});

export const updateSystemConfigSchema = zod.object({
  configs: zod
    .array(systemConfigItemSchema, {
      error: "La lista de configuraciones es requerida",
    })
    .min(1, {
      error: "Debe enviar al menos una configuración para actualizar",
    }),
});

export type SystemConfigItemSchema = zod.infer<typeof systemConfigItemSchema>;
export type UpdateSystemConfigSchema = zod.infer<
  typeof updateSystemConfigSchema
>;
