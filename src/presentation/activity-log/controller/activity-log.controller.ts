import type { Request, Response } from "express";
import { GetActivityLogsUseCase } from "../../../domain/use-cases/activity-log/get-activity-logs.use-case";
import { GetActivityLogByIdUseCase } from "../../../domain/use-cases/activity-log/get-activity-log-by-id.use-case";
import { SearchActivityLogsDto } from "../../../domain/dto/activity-log/search-activity-logs.dto";
import type { ActivityLogRepository } from "../../../domain/repositories/activity-log.repository";

export class ActivityLogController {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  getActivityLogs = async (req: Request, res: Response) => {
    try {
      const dto = SearchActivityLogsDto.fromObject(req.query);
      const useCase = new GetActivityLogsUseCase(this.activityLogRepository);
      const result = await useCase.execute(dto);

      return res.status(200).json({
        activityLogs: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error("Error getting activity logs:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener registros de actividad" });
    }
  };

  getActivityLogById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const useCase = new GetActivityLogByIdUseCase(this.activityLogRepository);
      const activityLog = await useCase.execute(id!);

      if (!activityLog) {
        return res
          .status(404)
          .json({ error: "Registro de actividad no encontrado" });
      }

      return res.status(200).json(activityLog);
    } catch (error) {
      console.error("Error getting activity log:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener registro de actividad" });
    }
  };
}
