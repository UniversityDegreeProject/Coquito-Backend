import { Router } from "express";
import { SaleController } from "../controller/sale.controller";
import { SaleRepositoryImpl } from "../../../infrastructure/repositories/sale.repository.impl";
import { SaleDatasourceImpl } from "../../../infrastructure/datasource/sale.datasource.impl";

export class SaleRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const saleDatasourceImpl = new SaleDatasourceImpl();
    const saleRepositoryImpl = new SaleRepositoryImpl(saleDatasourceImpl);
    const saleController = new SaleController(saleRepositoryImpl);

    //* RESTful sale routes
    router.post("/", saleController.createSale);
    router.get("/", saleController.getSales);
    router.get("/:saleId", saleController.getSaleById);

    return router;
  }
}
