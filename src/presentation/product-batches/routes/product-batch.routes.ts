import { Router } from "express";
import { ProductBatchController } from "../controller/product-batch.controller";
import { ProductBatchRepositoryImpl } from "../../../infrastructure/repositories/product-batch.repository.impl";
import { ProductBatchDatasourceImpl } from "../../../infrastructure/datasource/product-batch.datasource.impl";

export class ProductBatchRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const productBatchDatasourceImpl = new ProductBatchDatasourceImpl();
    const productBatchRepositoryImpl = new ProductBatchRepositoryImpl(
      productBatchDatasourceImpl
    );
    const productBatchController = new ProductBatchController(productBatchRepositoryImpl);

    //* RESTful product batch routes
    
    // Crear batch para un producto específico
    router.post("/:productId/batches", productBatchController.createBatch);
    
    // Obtener todos los batches de un producto
    router.get("/:productId/batches", productBatchController.getBatchesByProduct);
    
    // Actualizar stock de un batch específico
    router.patch("/batches/:batchId", productBatchController.updateBatchStock);
    
    // Eliminar un batch
    router.delete("/batches/:batchId", productBatchController.deleteBatch);

    return router;
  }
}

