import { ProductEntity } from "../entities/product.entity";
import { CreateProductDto } from "../dto/product/create-product.dto";
import { UpdateProductDto } from "../dto/product/update-product.dto";
import { GetProductByIdDto } from "../dto/product/get-product-by-id.dto";
import { DeleteProductByIdDto } from "../dto/product/delete-product-by-id.dto";
import { PaginateResponse } from "../interfaces/shared";
import { GetProductOptionalFiltersDto } from "../dto/product/get-product-optional-filters.dto";

export abstract class ProductDatasource {
  abstract getProducts(getProductOptionalFiltersDto: GetProductOptionalFiltersDto): Promise<PaginateResponse<ProductEntity>>;
  abstract createProduct(product: CreateProductDto): Promise<ProductEntity>;
  abstract updateProduct(product: UpdateProductDto): Promise<ProductEntity>;
  abstract deleteProduct(id: DeleteProductByIdDto): Promise<ProductEntity>;
  abstract getProductById(id: GetProductByIdDto): Promise<ProductEntity>;
}
