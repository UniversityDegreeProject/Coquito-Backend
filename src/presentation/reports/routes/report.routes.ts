import { Router } from "express";
import { ReportController } from "../controller/report.controller";
import { ReportRepositoryImpl } from "../../../infrastructure/repositories/report.repository.impl";
import { ReportDatasourceImpl } from "../../../infrastructure/datasource/report.datasource.impl";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { JwtAdapter, env } from "../../../config";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";

export class ReportRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const reportDatasourceImpl = new ReportDatasourceImpl();
    const reportRepositoryImpl = new ReportRepositoryImpl(reportDatasourceImpl);
    const reportController = new ReportController(reportRepositoryImpl);

    const authMiddleware = new AuthMiddleware(
      new JwtAdapter(env.JWT_SEED),
      new UserRepositoryImpl(new UserDatasourceImpl()),
    );

    //* RESTful report routes
    router.get(
      "/daily",
      [authMiddleware.validateJWT],
      reportController.getDailyReport,
    );
    router.get(
      "/sales",
      [authMiddleware.validateJWT],
      reportController.getSalesReport,
    );
    router.get(
      "/products",
      [authMiddleware.validateJWT],
      reportController.getProductsReport,
    );
    router.get(
      "/customers",
      [authMiddleware.validateJWT],
      reportController.getCustomersReport,
    );
    router.get(
      "/cash-register-summary",
      [authMiddleware.validateJWT],
      reportController.getCashRegisterSummary,
    );
    router.get(
      "/sellers",
      [authMiddleware.validateJWT],
      reportController.getSellersReport,
    );

    return router;
  }
}
