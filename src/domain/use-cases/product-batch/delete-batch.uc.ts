import { ProductBatchEntity } from "../../entities/product-batch.entity";
import { DeleteBatchDto } from "../../dto/product-batch/delete-batch.dto";
import { ProductBatchRepository } from "../../repositories/product-batch.repository";

interface DeleteBatchUseCase {
  execute(dto: DeleteBatchDto): Promise<ProductBatchEntity>;
}

export class DeleteBatchUseCaseImpl implements DeleteBatchUseCase {
  constructor(private readonly productBatchRepository: ProductBatchRepository) {}

  execute(dto: DeleteBatchDto): Promise<ProductBatchEntity> {
    return this.productBatchRepository.deleteBatch(dto);
  }
}

