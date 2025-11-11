import { Router } from "express";
import { CashRegisterController } from "../controller/cash-register.controller";
import { CashRegisterRepositoryImpl } from "../../../infrastructure/repositories/cash-register.repository.impl";
import { CashRegisterDatasourceImpl } from "../../../infrastructure/datasource/cash-register.datasource.impl";

export class CashRegisterRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const cashRegisterDatasourceImpl = new CashRegisterDatasourceImpl();
    const cashRegisterRepositoryImpl = new CashRegisterRepositoryImpl(
      cashRegisterDatasourceImpl
    );
    const cashRegisterController = new CashRegisterController(
      cashRegisterRepositoryImpl
    );

    //* RESTful cash register routes
    router.post("/open", cashRegisterController.openCashRegister);
    router.post("/close", cashRegisterController.closeCashRegister);
    router.get("/current/:userId", cashRegisterController.getCurrentCashRegister);

    return router;
  }
}

