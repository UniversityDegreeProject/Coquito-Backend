import { ProductBatchEntity } from "../../entities/product-batch.entity";
import { CreateProductBatchDto } from "../../dto/product-batch/create-product-batch.dto";
import { ProductBatchRepository } from "../../repositories/product-batch.repository";

interface CreateProductBatchUseCase {
  execute(createBatchDto: CreateProductBatchDto): Promise<ProductBatchEntity>;
}

export class CreateProductBatchUseCaseImpl implements CreateProductBatchUseCase {
  constructor(private readonly productBatchRepository: ProductBatchRepository) {}

  execute(createBatchDto: CreateProductBatchDto): Promise<ProductBatchEntity> {
    return this.productBatchRepository.createBatch(createBatchDto);
  }
}

