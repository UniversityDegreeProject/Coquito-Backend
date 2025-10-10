import { Router } from "express";


export class UserRoutes {

  constructor() {
    
  }


  static get routes(): Router {
    const router = Router();

    // router.get('/users', UserRoutes.routes);
    // router.patch('/users', UserRoutes.routes);
    
    return router;
  }
}