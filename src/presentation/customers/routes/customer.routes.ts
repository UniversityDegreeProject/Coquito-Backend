import { Router } from "express";
import { CustomerController } from "../controller/customer.controller";
import { CustomerRepositoryImpl } from "../../../infrastructure/repositories/customer.repository.impl";
import { CustomerDatasourceImpl } from "../../../infrastructure/datasource/customer.datasource.impl";
import { BcryptAdapter } from "../../../config/bcrypt.adapter";

export class CustomerRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const bcryptAdapter = new BcryptAdapter();
    const customerDatasourceImpl = new CustomerDatasourceImpl();
    const customerRepositoryImpl = new CustomerRepositoryImpl(customerDatasourceImpl);
    const customerController = new CustomerController(customerRepositoryImpl, bcryptAdapter);

    //* RESTful customers routes
    router.get('/', customerController.getCustomers);
    router.get('/:id', customerController.getCustomerById);
    router.post('/', customerController.createCustomer);
    router.patch('/:id', customerController.updateCustomer);
    router.delete('/:id', customerController.deleteCustomer);

    return router;
  }
}

