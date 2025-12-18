import { SystemConfigEntity } from "../entities/system-config.entity";
import { UpdateSystemConfigDto } from "../dto/system-config/update-system-config.dto";

export abstract class SystemConfigDatasource {
  // * Obtiene todas las configuraciones del sistema
  abstract getAll(): Promise<SystemConfigEntity[]>;

  // * Actualiza o crea múltiples configuraciones del sistema
  abstract upsertMany(
    dto: UpdateSystemConfigDto
  ): Promise<SystemConfigEntity[]>;
}
