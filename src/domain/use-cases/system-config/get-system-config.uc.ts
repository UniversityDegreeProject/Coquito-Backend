import { SystemConfigEntity } from "../../entities/system-config.entity";
import { SystemConfigRepository } from "../../repositories/system-config.repository";

export interface GetSystemConfigUseCase {
  execute(): Promise<SystemConfigEntity[]>;
}

export class GetSystemConfigUseCaseImpl implements GetSystemConfigUseCase {
  constructor(
    private readonly systemConfigRepository: SystemConfigRepository
  ) {}

  execute(): Promise<SystemConfigEntity[]> {
    return this.systemConfigRepository.getAll();
  }
}
