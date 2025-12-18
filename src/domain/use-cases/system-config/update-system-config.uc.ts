import { SystemConfigEntity } from "../../entities/system-config.entity";
import { UpdateSystemConfigDto } from "../../dto/system-config/update-system-config.dto";
import { SystemConfigRepository } from "../../repositories/system-config.repository";

export interface UpdateSystemConfigUseCase {
  execute(dto: UpdateSystemConfigDto): Promise<SystemConfigEntity[]>;
}

export class UpdateSystemConfigUseCaseImpl
  implements UpdateSystemConfigUseCase
{
  constructor(
    private readonly systemConfigRepository: SystemConfigRepository
  ) {}

  execute(dto: UpdateSystemConfigDto): Promise<SystemConfigEntity[]> {
    return this.systemConfigRepository.upsertMany(dto);
  }
}
