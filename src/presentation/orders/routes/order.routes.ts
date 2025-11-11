import { Router } from "express";
import { OrderController } from "../controller/order.controller";
import { OrderRepositoryImpl } from "../../../infrastructure/repositories/order.repository.impl";
import { OrderDatasourceImpl } from "../../../infrastructure/datasource/order.datasource.impl";

export class OrderRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const orderDatasourceImpl = new OrderDatasourceImpl();
    const orderRepositoryImpl = new OrderRepositoryImpl(orderDatasourceImpl);
    const orderController = new OrderController(orderRepositoryImpl);

    //* RESTful order routes
    router.post("/", orderController.createOrder);
    router.get("/", orderController.searchOrders);
    router.get("/:orderId", orderController.getOrderById);

    return router;
  }
}

