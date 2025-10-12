import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";
import { BcryptAdapter } from "../../../config/bcrypt.adapter";


export class UserRoutes {

  constructor() {
    
  }


  static get routes(): Router {
    const router = Router();

    const bcryptAdapter = new BcryptAdapter();
    const userDatasourceImpl = new UserDatasourceImpl(bcryptAdapter);
    const userRepositoryImpl = new UserRepositoryImpl(userDatasourceImpl);
    const userController = new UserController(userRepositoryImpl);

    //* RESTful users routes
    router.get('/', userController.getAllUsers);                    
    router.get('/search', userController.searchUsers);              
    router.get('/search/by-email', userController.getUserByEmail);  
    router.get('/:id', userController.getUserById);                 
    router.patch('/:id', userController.updateUser);                
    router.delete('/:id', userController.deleteUser);               
    
    return router;
  }
}