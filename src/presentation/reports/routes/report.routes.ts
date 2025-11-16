import { Router } from "express";
import { ReportController } from "../controller/report.controller";
import { ReportRepositoryImpl } from "../../../infrastructure/repositories/report.repository.impl";
import { ReportDatasourceImpl } from "../../../infrastructure/datasource/report.datasource.impl";

export class ReportRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const reportDatasourceImpl = new ReportDatasourceImpl();
    const reportRepositoryImpl = new ReportRepositoryImpl(reportDatasourceImpl);
    const reportController = new ReportController(reportRepositoryImpl);

    //* RESTful report routes
    router.get("/daily", reportController.getDailyReport);
    router.get("/sales", reportController.getSalesReport);
    router.get("/products", reportController.getProductsReport);
    router.get("/customers", reportController.getCustomersReport);
    router.get("/cash-register-summary", reportController.getCashRegisterSummary);

    return router;
  }
}

