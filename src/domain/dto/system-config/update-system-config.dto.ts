import {
  UpdateSystemConfigSchema,
  updateSystemConfigSchema,
  SystemConfigItemSchema,
} from "../../schemas/system-config/update-system-config.schema";

export class UpdateSystemConfigDto {
  constructor(public readonly configs: SystemConfigItemSchema[]) {}

  // * Crea el DTO validando contra el schema de Zod
  public static create(dto: {
    [key: string]: any;
  }): [string?, UpdateSystemConfigDto?] {
    const result = updateSystemConfigSchema.safeParse(dto);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { configs } = result.data as UpdateSystemConfigSchema;
    return [undefined, new UpdateSystemConfigDto(configs)];
  }
}
