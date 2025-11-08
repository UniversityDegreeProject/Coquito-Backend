import {
  ProductBatchEntity,
  ProductBatchDatasource,
  ProductBatchRepository,
  CreateProductBatchDto,
  GetBatchesByProductDto,
  UpdateBatchStockDto,
  DeleteBatchDto,
} from "../../domain";

export class ProductBatchRepositoryImpl implements ProductBatchRepository {
  constructor(private readonly productBatchDatasource: ProductBatchDatasource) {}

  createBatch(createBatchDto: CreateProductBatchDto): Promise<ProductBatchEntity> {
    return this.productBatchDatasource.createBatch(createBatchDto);
  }

  getBatchesByProduct(dto: GetBatchesByProductDto): Promise<ProductBatchEntity[]> {
    return this.productBatchDatasource.getBatchesByProduct(dto);
  }

  updateBatchStock(dto: UpdateBatchStockDto): Promise<ProductBatchEntity> {
    return this.productBatchDatasource.updateBatchStock(dto);
  }

  deleteBatch(dto: DeleteBatchDto): Promise<ProductBatchEntity> {
    return this.productBatchDatasource.deleteBatch(dto);
  }
}

