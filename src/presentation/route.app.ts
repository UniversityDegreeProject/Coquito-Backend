import { Router } from "express";
import { AuthRoutes } from "./auth/routes/auth.route";


export class AppRoutes {

  constructor() {
    
  }


  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    
    return router;
  }
}