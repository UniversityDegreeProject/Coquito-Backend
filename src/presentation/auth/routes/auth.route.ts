import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { UserDatasourceImpl, UserRepositoryImpl, AuthDatasourceImpl, AuthRepositoryImpl } from "../../../infrastructure";
import { JwtAdapter, env } from "../../../config";


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
    
    //* Instancia de JWT adapter
    const jwtAdapter = new JwtAdapter(env.JWT_SEED);
    
    //* Controller con repositorios y JWT adapter
    const authController = new AuthController(userRepositoryImpl, authRepositoryImpl, jwtAdapter);
    
    router.post('/login', authController.loginUser);
    router.post('/register', authController.registerUser);
    router.get('/users', authController.getUsers);
    
    return router;
  }
}