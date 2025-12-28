import { Router } from "express";
import { CategoryController } from "../controller/category.controller";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/category.repository.impl";
import { CategoryDatasourceImpl } from "../../../infrastructure/datasource/category.datasource.impl";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { JwtAdapter, env } from "../../../config";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";

export class CategoryRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const categoryDatasourceImpl = new CategoryDatasourceImpl();
    const categoryRepositoryImpl = new CategoryRepositoryImpl(
      categoryDatasourceImpl
    );
    const categoryController = new CategoryController(categoryRepositoryImpl);

    //* RESTful categories routes
    const authMiddleware = new AuthMiddleware(
      new JwtAdapter(env.JWT_SEED),
      new UserRepositoryImpl(new UserDatasourceImpl())
    );

    //* RESTful categories routes
    router.get(
      "/",
      [authMiddleware.validateJWT],
      categoryController.getCategories
    );
    router.get(
      "/:id",
      [authMiddleware.validateJWT],
      categoryController.getCategoryById
    );
    router.post(
      "/",
      [authMiddleware.validateJWT],
      categoryController.createCategory
    );
    router.patch(
      "/:id",
      [authMiddleware.validateJWT],
      categoryController.updateCategory
    );
    router.delete(
      "/:id",
      [authMiddleware.validateJWT],
      categoryController.deleteCategory
    );

    return router;
  }
}
