import { Router } from "express";
import { ActivityLogController } from "../controller/activity-log.controller";
import { ActivityLogRepositoryImpl } from "../../../infrastructure/repositories/activity-log.repository.impl";
import { ActivityLogDatasourceImpl } from "../../../infrastructure/datasource/activity-log.datasource.impl";

export class ActivityLogRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const activityLogDatasource = new ActivityLogDatasourceImpl();
    const activityLogRepository = new ActivityLogRepositoryImpl(
      activityLogDatasource
    );
    const activityLogController = new ActivityLogController(
      activityLogRepository
    );

    // * Rutas para gestionar el registro de actividades
    router.get("/", activityLogController.getActivityLogs);
    router.get("/:id", activityLogController.getActivityLogById);

    return router;
  }
}
