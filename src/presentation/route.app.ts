import { Router } from "express";
import { AuthRoutes } from "./auth/routes/auth.route";
import { UserRoutes } from "./users/routes/user.routes";
import { CategoryRoutes } from "./categories/routes/category.routes";


export class AppRoutes {

  constructor() {
    
  }


  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/users', UserRoutes.routes);
    router.use('/api/categories', CategoryRoutes.routes);
    
    return router;
  }
}