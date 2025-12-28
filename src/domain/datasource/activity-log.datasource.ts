import type { ActivityLogEntity, PaginatedActivityLogsEntity } from '../entities/activity-log.entity';
import type { SearchActivityLogsDto } from '../dto/activity-log/search-activity-logs.dto';

export abstract class ActivityLogDatasource {
  abstract getActivityLogs(dto: SearchActivityLogsDto): Promise<PaginatedActivityLogsEntity>;
  abstract getActivityLogById(id: string): Promise<ActivityLogEntity | null>;
}
