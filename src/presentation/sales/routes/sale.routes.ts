import { Router } from "express";
import { SaleController } from "../controller/sale.controller";
import { SaleRepositoryImpl } from "../../../infrastructure/repositories/sale.repository.impl";
import { SaleDatasourceImpl } from "../../../infrastructure/datasource/sale.datasource.impl";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { JwtAdapter, env } from "../../../config";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";

export class SaleRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const saleDatasourceImpl = new SaleDatasourceImpl();
    const saleRepositoryImpl = new SaleRepositoryImpl(saleDatasourceImpl);
    const saleController = new SaleController(saleRepositoryImpl);

    //* RESTful sale routes
    const authMiddleware = new AuthMiddleware(
      new JwtAdapter(env.JWT_SEED),
      new UserRepositoryImpl(new UserDatasourceImpl())
    );

    //* RESTful sale routes
    router.post("/", [authMiddleware.validateJWT], saleController.createSale);
    router.get("/", [authMiddleware.validateJWT], saleController.getSales);
    router.get(
      "/:saleId",
      [authMiddleware.validateJWT],
      saleController.getSaleById
    );

    return router;
  }
}
