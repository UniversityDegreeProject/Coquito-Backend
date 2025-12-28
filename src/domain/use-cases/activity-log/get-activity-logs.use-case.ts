import type { ActivityLogRepository } from "../../repositories/activity-log.repository";
import type { SearchActivityLogsDto } from "../../dto/activity-log/search-activity-logs.dto";
import type { PaginatedActivityLogsEntity } from "../../entities/activity-log.entity";

export class GetActivityLogsUseCase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async execute(
    dto: SearchActivityLogsDto
  ): Promise<PaginatedActivityLogsEntity> {
    return await this.activityLogRepository.getActivityLogs(dto);
  }
}
