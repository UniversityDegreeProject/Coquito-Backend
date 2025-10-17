import { ProductEntity } from "../../entities/product.entity";
import { DeleteProductByIdDto } from "../../dto/product/delete-product-by-id.dto";
import { ProductRepository } from "../../repositories/product.repository";

interface DeleteProductUseCase {
  execute(id: DeleteProductByIdDto): Promise<ProductEntity>;
}

export class DeleteProductUseCaseImpl implements DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: DeleteProductByIdDto): Promise<ProductEntity> {
    return this.productRepository.deleteProduct(id);
  }
}

