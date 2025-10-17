import { ProductEntity } from "../../entities/product.entity";
import { GetProductByIdDto } from "../../dto/product/get-product-by-id.dto";
import { ProductRepository } from "../../repositories/product.repository";

interface GetProductByIdUseCase {
  execute(id: GetProductByIdDto): Promise<ProductEntity>;
}

export class GetProductByIdUseCaseImpl implements GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: GetProductByIdDto): Promise<ProductEntity> {
    return this.productRepository.getProductById(id);
  }
}

