import { Router } from "express";
import { AuthRoutes } from "./auth/routes/auth.route";
import { UserRoutes } from "./users/routes/user.routes";
import { CategoryRoutes } from "./categories/routes/category.routes";
import { ProductRoutes } from "./products/routes/product.routes";
import { CustomerRoutes } from "./customers/routes/customer.routes";


export class AppRoutes {

  constructor() {
    
  }


  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/users', UserRoutes.routes);
    router.use('/api/categories', CategoryRoutes.routes);
    router.use('/api/products', ProductRoutes.routes);
    router.use('/api/customers', CustomerRoutes.routes);
    
    return router;
  }
}