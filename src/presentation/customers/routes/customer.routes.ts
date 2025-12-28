import { Router } from "express";
import { CustomerController } from "../controller/customer.controller";
import { CustomerRepositoryImpl } from "../../../infrastructure/repositories/customer.repository.impl";
import { CustomerDatasourceImpl } from "../../../infrastructure/datasource/customer.datasource.impl";
import { BcryptAdapter } from "../../../config/bcrypt.adapter";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { JwtAdapter, env } from "../../../config";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";

export class CustomerRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const bcryptAdapter = new BcryptAdapter();
    const customerDatasourceImpl = new CustomerDatasourceImpl();
    const customerRepositoryImpl = new CustomerRepositoryImpl(
      customerDatasourceImpl
    );
    const customerController = new CustomerController(
      customerRepositoryImpl,
      bcryptAdapter
    );

    const authMiddleware = new AuthMiddleware(
      new JwtAdapter(env.JWT_SEED),
      new UserRepositoryImpl(new UserDatasourceImpl())
    );

    //* RESTful customers routes
    router.get(
      "/",
      [authMiddleware.validateJWT],
      customerController.getCustomers
    );
    router.get(
      "/:id",
      [authMiddleware.validateJWT],
      customerController.getCustomerById
    );
    router.post(
      "/",
      [authMiddleware.validateJWT],
      customerController.createCustomer
    );
    router.patch(
      "/:id",
      [authMiddleware.validateJWT],
      customerController.updateCustomer
    );
    router.delete(
      "/:id",
      [authMiddleware.validateJWT],
      customerController.deleteCustomer
    );

    return router;
  }
}
