import { ProductEntity } from "../../entities/product.entity";
import { UpdateProductDto } from "../../dto/product/update-product.dto";
import { ProductRepository } from "../../repositories/product.repository";

interface UpdateProductUseCase {
  execute(product: UpdateProductDto): Promise<ProductEntity>;
}

export class UpdateProductUseCaseImpl implements UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(product: UpdateProductDto): Promise<ProductEntity> {
    return this.productRepository.updateProduct(product);
  }
}

