import { ProductBatchEntity } from "../../entities/product-batch.entity";
import { GetBatchesByProductDto } from "../../dto/product-batch/get-batches-by-product.dto";
import { ProductBatchRepository } from "../../repositories/product-batch.repository";

interface GetBatchesByProductUseCase {
  execute(dto: GetBatchesByProductDto): Promise<ProductBatchEntity[]>;
}

export class GetBatchesByProductUseCaseImpl implements GetBatchesByProductUseCase {
  constructor(private readonly productBatchRepository: ProductBatchRepository) {}

  execute(dto: GetBatchesByProductDto): Promise<ProductBatchEntity[]> {
    return this.productBatchRepository.getBatchesByProduct(dto);
  }
}

