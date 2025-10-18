import { Router } from "express";
import { StockMovementController } from "../controller/stock-movement.controller";
import { StockMovementRepositoryImpl } from "../../../infrastructure/repositories/stock-movement.repository.impl";
import { StockMovementDatasourceImpl } from "../../../infrastructure/datasource/stock-movement.datasource.impl";

export class StockMovementRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const stockMovementDatasourceImpl = new StockMovementDatasourceImpl();
    const stockMovementRepositoryImpl = new StockMovementRepositoryImpl(
      stockMovementDatasourceImpl
    );
    const stockMovementController = new StockMovementController(stockMovementRepositoryImpl);

    //* RESTful stock movement routes
    router.post("/", stockMovementController.createStockMovement);
    router.get("/search", stockMovementController.searchStockMovements);
    router.get("/product/:productId", stockMovementController.getStockMovementsByProduct);
    router.get("/:id", stockMovementController.getStockMovementById);

    return router;
  }
}

