import { ProductEntity } from "../../entities/product.entity";
import { CreateProductDto } from "../../dto/product/create-product.dto";
import { ProductRepository } from "../../repositories/product.repository";

interface CreateProductUseCase {
  execute(product: CreateProductDto): Promise<ProductEntity>;
}

export class CreateProductUseCaseImpl implements CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(product: CreateProductDto): Promise<ProductEntity> {
    return this.productRepository.createProduct(product);
  }
}

