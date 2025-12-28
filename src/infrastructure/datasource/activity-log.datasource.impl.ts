import { prismaClient } from "../../data/postgres";
import type { ActivityLogDatasource } from "../../domain/datasource/activity-log.datasource";
import type { SearchActivityLogsDto } from "../../domain/dto/activity-log/search-activity-logs.dto";
import type {
  ActivityLogEntity,
  PaginatedActivityLogsEntity,
} from "../../domain/entities/activity-log.entity";

export class ActivityLogDatasourceImpl implements ActivityLogDatasource {
  async getActivityLogs(
    dto: SearchActivityLogsDto
  ): Promise<PaginatedActivityLogsEntity> {
    const { page, limit, userId, action, entity, startDate, endDate, search } =
      dto;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build filters
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    if (entity) {
      where.entity = entity;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prismaClient.activityLog.count({ where });

    // Get logs with user info
    const activityLogs = await prismaClient.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });

    const totalPages = Math.ceil(total / limit);

    const mappedLogs = activityLogs.map((log) => ({
      ...log,
      user: log.user
        ? {
            id: log.user.id,
            name: `${log.user.firstName} ${log.user.lastName}`,
            email: log.user.email,
            role: log.user.role,
          }
        : undefined,
    }));

    return {
      data: mappedLogs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getActivityLogById(id: string): Promise<ActivityLogEntity | null> {
    const activityLog = await prismaClient.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!activityLog) return null;

    return {
      ...activityLog,
      user: activityLog.user
        ? {
            id: activityLog.user.id,
            name: `${activityLog.user.firstName} ${activityLog.user.lastName}`,
            email: activityLog.user.email,
            role: activityLog.user.role,
          }
        : undefined,
    };
  }
}
