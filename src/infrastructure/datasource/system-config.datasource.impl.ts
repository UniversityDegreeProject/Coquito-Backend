import { prismaClient } from "../../data/postgres";
import {
  SystemConfigDatasource,
  SystemConfigEntity,
  UpdateSystemConfigDto,
} from "../../domain";

export class SystemConfigDatasourceImpl implements SystemConfigDatasource {
  constructor() {}

  // * Obtiene todas las configuraciones del sistema
  async getAll(): Promise<SystemConfigEntity[]> {
    const configs = await prismaClient.systemConfig.findMany({
      orderBy: {
        key: "desc",
      },
    });

    return configs.map((config) => SystemConfigEntity.mapFromPrisma(config));
  }

  // * Actualiza o crea múltiples configuraciones del sistema
  async upsertMany(dto: UpdateSystemConfigDto): Promise<SystemConfigEntity[]> {
    const upsertedConfigs = await Promise.all(
      dto.configs.map((config) =>
        prismaClient.systemConfig.upsert({
          where: { key: config.key },
          update: {
            value: config.value,
            description: config.description ?? null,
          },
          create: {
            key: config.key,
            value: config.value,
            description: config.description ?? null,
          },
        }),
      ),
    );

    return upsertedConfigs.map((config) =>
      SystemConfigEntity.mapFromPrisma(config),
    );
  }
}
