import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { UserDatasourceImpl, UserRepositoryImpl, AuthDatasourceImpl, AuthRepositoryImpl } from "../../../infrastructure";


export class AuthRoutes {

  constructor() {
    
  }


  static get routes(): Router {
    const router = Router();
    
    //* Instancias de user crud
    const userDatasourceImpl = new UserDatasourceImpl();
    const userRepositoryImpl = new UserRepositoryImpl(userDatasourceImpl);
    
    //* Instancias de auth login
    const authDatasourceImpl = new AuthDatasourceImpl();
    const authRepositoryImpl = new AuthRepositoryImpl(authDatasourceImpl);
    
    //* Controller con ambos repositorios
    const authController = new AuthController(userRepositoryImpl, authRepositoryImpl);
    
    router.post('/login', authController.loginUser);
    router.post('/register', authController.registerUser);
    router.get('/users', authController.getUsers);
    
    return router;
  }
}