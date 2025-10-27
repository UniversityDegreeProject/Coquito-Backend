import { Router } from "express";
import { CategoryController } from "../controller/category.controller";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/category.repository.impl";
import { CategoryDatasourceImpl } from "../../../infrastructure/datasource/category.datasource.impl";

export class CategoryRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const categoryDatasourceImpl = new CategoryDatasourceImpl();
    const categoryRepositoryImpl = new CategoryRepositoryImpl(categoryDatasourceImpl);
    const categoryController = new CategoryController(categoryRepositoryImpl);

    //* RESTful categories routes
    router.get('/', categoryController.getCategories);
    router.get('/:id', categoryController.getCategoryById);
    router.post('/', categoryController.createCategory);
    router.patch('/:id', categoryController.updateCategory);
    router.delete('/:id', categoryController.deleteCategory);

    return router;
  }
}

