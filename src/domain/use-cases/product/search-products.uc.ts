import { ProductEntity } from "../../entities/product.entity";
import { SearchProductsDto } from "../../dto/product/search-products.dto";
import { ProductRepository } from "../../repositories/product.repository";

interface SearchProductsUseCase {
  execute(searchProductsDto: SearchProductsDto): Promise<{
    products: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export class SearchProductsUseCaseImpl implements SearchProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(searchProductsDto: SearchProductsDto): Promise<{
    products: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.productRepository.searchProducts(searchProductsDto);
  }
}

