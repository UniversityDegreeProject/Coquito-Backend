import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { UserDatasourceImpl, UserRepositoryImpl, AuthDatasourceImpl, AuthRepositoryImpl } from "../../../infrastructure";
import { JwtAdapter, env, EmailAdapter, BcryptAdapter } from "../../../config";
import { EmailService } from "../../../domain/services/email.service";


export class AuthRoutes {

  constructor() {
    
  }


  static get routes(): Router {
    const router = Router();


    //* Instancia de JWT y bcrypt adapter
    const jwtAdapter = new JwtAdapter(env.JWT_SEED);
    const bcryptAdapter = new BcryptAdapter();

    //* Instancias de user crud
    const userDatasourceImpl = new UserDatasourceImpl(bcryptAdapter);
    const userRepositoryImpl = new UserRepositoryImpl(userDatasourceImpl);
    
    
    //* Instancias de auth login
    const authDatasourceImpl = new AuthDatasourceImpl(bcryptAdapter);
    const authRepositoryImpl = new AuthRepositoryImpl(authDatasourceImpl);
    
    //* Instancia de Email adapter y servicio
    const emailAdapter = new EmailAdapter(
      env.MAILER_SERVICE,
      env.MAILER_EMAIL,
      env.MAILER_SECRET_KEY
    );
    const emailService = new EmailService(
      emailAdapter, 
      env.WEBSERVICE_URL,
      env.FRONTEND_URL
    );
    
    //* Controller con repositorios, JWT adapter y Email service
    const authController = new AuthController(
      userRepositoryImpl, 
      authRepositoryImpl, 
      jwtAdapter,
      emailService,
    );
    
    router.post('/login', authController.loginUser);
    router.post('/register', authController.registerUser);
    router.post('/retry-verify-email', authController.retryVerifyEmail);
    router.get('/verify-email/:token', authController.verifyEmail);
    router.post('/forgot-password', authController.forgotPassword);
    router.get('/reset-password-page/:token', authController.resetPasswordPage);
    router.post('/reset-password-submit', authController.resetPasswordSubmit);
    router.post('/reset-password', authController.resetPassword);
    router.post('/refresh-token', authController.refreshToken);
    
    return router;
  }
}