import { Router } from "express";
import { SystemConfigController } from "../controller/system-config.controller";
import { SystemConfigRepositoryImpl } from "../../../infrastructure/repositories/system-config.repository.impl";
import { SystemConfigDatasourceImpl } from "../../../infrastructure/datasource/system-config.datasource.impl";

export class SystemConfigRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const systemConfigDatasource = new SystemConfigDatasourceImpl();
    const systemConfigRepository = new SystemConfigRepositoryImpl(
      systemConfigDatasource
    );
    const systemConfigController = new SystemConfigController(
      systemConfigRepository
    );

    // * Rutas para gestionar la configuración del sistema
    router.get("/", systemConfigController.getSystemConfig);
    router.put("/", systemConfigController.updateSystemConfig);

    return router;
  }
}
