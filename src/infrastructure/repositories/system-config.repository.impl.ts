import {
  SystemConfigDatasource,
  SystemConfigEntity,
  SystemConfigRepository,
  UpdateSystemConfigDto,
} from "../../domain";

export class SystemConfigRepositoryImpl implements SystemConfigRepository {
  constructor(
    private readonly systemConfigDatasource: SystemConfigDatasource
  ) {}

  // * Obtiene todas las configuraciones del sistema
  getAll(): Promise<SystemConfigEntity[]> {
    return this.systemConfigDatasource.getAll();
  }

  // * Actualiza o crea múltiples configuraciones del sistema
  upsertMany(dto: UpdateSystemConfigDto): Promise<SystemConfigEntity[]> {
    return this.systemConfigDatasource.upsertMany(dto);
  }
}
