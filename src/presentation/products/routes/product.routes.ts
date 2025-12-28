import { Router } from "express";
import { ProductController } from "../controller/product.controller";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/product.repository.impl";
import { ProductDatasourceImpl } from "../../../infrastructure/datasource/product.datasource.impl";
import { ProductBatchController } from "../../product-batches/controller/product-batch.controller";
import { ProductBatchRepositoryImpl } from "../../../infrastructure/repositories/product-batch.repository.impl";
import { ProductBatchDatasourceImpl } from "../../../infrastructure/datasource/product-batch.datasource.impl";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { JwtAdapter, env } from "../../../config";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repository.impl";
import { UserDatasourceImpl } from "../../../infrastructure/datasource/user.datasource.impl";

export class ProductRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const productDatasourceImpl = new ProductDatasourceImpl();
    const productRepositoryImpl = new ProductRepositoryImpl(
      productDatasourceImpl
    );
    const productController = new ProductController(productRepositoryImpl);

    const productBatchDatasourceImpl = new ProductBatchDatasourceImpl();
    const productBatchRepositoryImpl = new ProductBatchRepositoryImpl(
      productBatchDatasourceImpl
    );
    const productBatchController = new ProductBatchController(
      productBatchRepositoryImpl
    );

    const authMiddleware = new AuthMiddleware(
      new JwtAdapter(env.JWT_SEED),
      new UserRepositoryImpl(new UserDatasourceImpl())
    );

    //* RESTful products routes
    router.get(
      "/",
      [authMiddleware.validateJWT],
      productController.getProducts
    );
    router.get(
      "/:id",
      [authMiddleware.validateJWT],
      productController.getProductById
    );
    router.post(
      "/",
      [authMiddleware.validateJWT],
      productController.createProduct
    );
    router.patch(
      "/:id",
      [authMiddleware.validateJWT],
      productController.updateProduct
    );
    router.delete(
      "/:id",
      [authMiddleware.validateJWT],
      productController.deleteProduct
    );

    //* Product batches routes (sub-resources)
    router.post(
      "/:productId/batches",
      [authMiddleware.validateJWT],
      productBatchController.createBatch
    );
    router.get(
      "/:productId/batches",
      [authMiddleware.validateJWT],
      productBatchController.getBatchesByProduct
    );
    router.patch(
      "/batches/:batchId",
      [authMiddleware.validateJWT],
      productBatchController.updateBatchStock
    );
    router.delete(
      "/batches/:batchId",
      [authMiddleware.validateJWT],
      productBatchController.deleteBatch
    );

    return router;
  }
}
