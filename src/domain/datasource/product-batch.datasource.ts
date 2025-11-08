import { ProductBatchEntity } from "../entities/product-batch.entity";
import { CreateProductBatchDto } from "../dto/product-batch/create-product-batch.dto";
import { GetBatchesByProductDto } from "../dto/product-batch/get-batches-by-product.dto";
import { UpdateBatchStockDto } from "../dto/product-batch/update-batch-stock.dto";
import { DeleteBatchDto } from "../dto/product-batch/delete-batch.dto";

export abstract class ProductBatchDatasource {
  abstract createBatch(createBatchDto: CreateProductBatchDto): Promise<ProductBatchEntity>;
  abstract getBatchesByProduct(dto: GetBatchesByProductDto): Promise<ProductBatchEntity[]>;
  abstract updateBatchStock(dto: UpdateBatchStockDto): Promise<ProductBatchEntity>;
  abstract deleteBatch(dto: DeleteBatchDto): Promise<ProductBatchEntity>;
}

