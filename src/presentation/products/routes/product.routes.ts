import { Router } from "express";
import { ProductController } from "../controller/product.controller";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/product.repository.impl";
import { ProductDatasourceImpl } from "../../../infrastructure/datasource/product.datasource.impl";

export class ProductRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const productDatasourceImpl = new ProductDatasourceImpl();
    const productRepositoryImpl = new ProductRepositoryImpl(productDatasourceImpl);
    const productController = new ProductController(productRepositoryImpl);

    //* RESTful products routes
    router.get('/', productController.getAllProducts);
    router.get('/search', productController.searchProducts);
    router.get('/:id', productController.getProductById);
    router.post('/', productController.createProduct);
    router.patch('/:id', productController.updateProduct);
    router.delete('/:id', productController.deleteProduct);

    return router;
  }
}

