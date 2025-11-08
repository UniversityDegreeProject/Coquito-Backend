import { Router } from "express";
import { ProductController } from "../controller/product.controller";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/product.repository.impl";
import { ProductDatasourceImpl } from "../../../infrastructure/datasource/product.datasource.impl";
import { ProductBatchController } from "../../product-batches/controller/product-batch.controller";
import { ProductBatchRepositoryImpl } from "../../../infrastructure/repositories/product-batch.repository.impl";
import { ProductBatchDatasourceImpl } from "../../../infrastructure/datasource/product-batch.datasource.impl";

export class ProductRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const productDatasourceImpl = new ProductDatasourceImpl();
    const productRepositoryImpl = new ProductRepositoryImpl(productDatasourceImpl);
    const productController = new ProductController(productRepositoryImpl);

    const productBatchDatasourceImpl = new ProductBatchDatasourceImpl();
    const productBatchRepositoryImpl = new ProductBatchRepositoryImpl(productBatchDatasourceImpl);
    const productBatchController = new ProductBatchController(productBatchRepositoryImpl);

    //* RESTful products routes
    router.get('/', productController.getProducts);
    router.get('/:id', productController.getProductById);
    router.post('/', productController.createProduct);
    router.patch('/:id', productController.updateProduct);
    router.delete('/:id', productController.deleteProduct);

    //* Product batches routes (sub-resources)
    router.post('/:productId/batches', productBatchController.createBatch);
    router.get('/:productId/batches', productBatchController.getBatchesByProduct);
    router.patch('/batches/:batchId', productBatchController.updateBatchStock);
    router.delete('/batches/:batchId', productBatchController.deleteBatch);

    return router;
  }
}

