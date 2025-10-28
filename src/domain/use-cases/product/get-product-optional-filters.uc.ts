import { GetProductOptionalFiltersDto } from "../../dto/product/get-product-optional-filters.dto";
import { PaginateResponse } from "../../interfaces/shared";
import { ProductEntity } from "../../entities/product.entity";
import { ProductRepository } from "../../repositories/product.repository";

interface GetProductOptionalFiltersUseCase {
  execute(getProductOptionalFiltersDto: GetProductOptionalFiltersDto): Promise<PaginateResponse<ProductEntity>>;
}

export class GetProductOptionalFiltersUseCaseImpl implements GetProductOptionalFiltersUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(getProductOptionalFiltersDto: GetProductOptionalFiltersDto): Promise<PaginateResponse<ProductEntity>> {
    return this.productRepository.getProducts(getProductOptionalFiltersDto);
  }
}