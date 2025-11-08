import { ProductBatchEntity } from "../../entities/product-batch.entity";
import { UpdateBatchStockDto } from "../../dto/product-batch/update-batch-stock.dto";
import { ProductBatchRepository } from "../../repositories/product-batch.repository";

interface UpdateBatchStockUseCase {
  execute(dto: UpdateBatchStockDto): Promise<ProductBatchEntity>;
}

export class UpdateBatchStockUseCaseImpl implements UpdateBatchStockUseCase {
  constructor(private readonly productBatchRepository: ProductBatchRepository) {}

  execute(dto: UpdateBatchStockDto): Promise<ProductBatchEntity> {
    return this.productBatchRepository.updateBatchStock(dto);
  }
}

