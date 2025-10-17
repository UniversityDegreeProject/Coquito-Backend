import { ProductEntity } from "../../entities/product.entity";
import { ProductRepository } from "../../repositories/product.repository";

interface GetProductsUseCase {
  execute(): Promise<ProductEntity[]>;
}

export class GetProductsUseCaseImpl implements GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(): Promise<ProductEntity[]> {
    return this.productRepository.getProducts();
  }
}

