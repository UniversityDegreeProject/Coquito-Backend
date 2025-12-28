import type { ActivityLogDatasource } from "../../domain/datasource/activity-log.datasource";
import type { ActivityLogRepository } from "../../domain/repositories/activity-log.repository";
import type { SearchActivityLogsDto } from "../../domain/dto/activity-log/search-activity-logs.dto";
import type {
  ActivityLogEntity,
  PaginatedActivityLogsEntity,
} from "../../domain/entities/activity-log.entity";

export class ActivityLogRepositoryImpl implements ActivityLogRepository {
  constructor(private readonly activityLogDatasource: ActivityLogDatasource) {}

  async getActivityLogs(
    dto: SearchActivityLogsDto
  ): Promise<PaginatedActivityLogsEntity> {
    return await this.activityLogDatasource.getActivityLogs(dto);
  }

  async getActivityLogById(id: string): Promise<ActivityLogEntity | null> {
    return await this.activityLogDatasource.getActivityLogById(id);
  }
}
