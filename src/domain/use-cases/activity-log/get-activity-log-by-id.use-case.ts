import type { ActivityLogRepository } from "../../repositories/activity-log.repository";
import type { ActivityLogEntity } from "../../entities/activity-log.entity";

export class GetActivityLogByIdUseCase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async execute(id: string): Promise<ActivityLogEntity | null> {
    return await this.activityLogRepository.getActivityLogById(id);
  }
}
