import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";
import { BcryptAdapter } from "../../../config/bcrypt.adapter";
import { AuthController } from "../../auth/controller/auth.controller";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { JwtAdapter, env } from "../../../config";

export class UserRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const bcryptAdapter = new BcryptAdapter();
    const userDatasourceImpl = new UserDatasourceImpl();
    const userRepositoryImpl = new UserRepositoryImpl(userDatasourceImpl);
    const userController = new UserController(
      userRepositoryImpl,
      bcryptAdapter
    );

    const authMiddleware = new AuthMiddleware(
      new JwtAdapter(env.JWT_SEED),
      new UserRepositoryImpl(new UserDatasourceImpl())
    );

    //* RESTful users routes
    router.get("/", [authMiddleware.validateJWT], userController.getUsers);
    router.get(
      "/search/by-email",
      [authMiddleware.validateJWT],
      userController.getUserByEmail
    );
    router.get(
      "/:id",
      [authMiddleware.validateJWT],
      userController.getUserById
    );
    router.patch(
      "/:id",
      [authMiddleware.validateJWT],
      userController.updateUser
    );
    router.delete(
      "/:id",
      [authMiddleware.validateJWT],
      userController.deleteUser
    );

    return router;
  }
}
