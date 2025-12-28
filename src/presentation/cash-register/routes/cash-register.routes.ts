import { Router } from "express";
import { CashRegisterController } from "../controller/cash-register.controller";
import { CashRegisterRepositoryImpl } from "../../../infrastructure/repositories/cash-register.repository.impl";
import { CashRegisterDatasourceImpl } from "../../../infrastructure/datasource/cash-register.datasource.impl";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { JwtAdapter, env } from "../../../config";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";

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

    const authMiddleware = new AuthMiddleware(
      new JwtAdapter(env.JWT_SEED),
      new UserRepositoryImpl(new UserDatasourceImpl())
    );

    //* RESTful cash register routes
    router.post(
      "/open",
      [authMiddleware.validateJWT],
      cashRegisterController.openCashRegister
    );
    router.post(
      "/close",
      [authMiddleware.validateJWT],
      cashRegisterController.closeCashRegister
    );
    router.get(
      "/current/:userId",
      [authMiddleware.validateJWT],
      cashRegisterController.getCurrentCashRegister
    );
    router.get(
      "/history",
      [authMiddleware.validateJWT],
      cashRegisterController.getCashRegisterHistory
    );

    return router;
  }
}
