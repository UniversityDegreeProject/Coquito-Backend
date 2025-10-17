import { ProductEntity } from "../entities/product.entity";
import { CreateProductDto } from "../dto/product/create-product.dto";
import { UpdateProductDto } from "../dto/product/update-product.dto";
import { GetProductByIdDto } from "../dto/product/get-product-by-id.dto";
import { DeleteProductByIdDto } from "../dto/product/delete-product-by-id.dto";
import { SearchProductsDto } from "../dto/product/search-products.dto";

export abstract class ProductDatasource {
  abstract getProducts(): Promise<ProductEntity[]>;
  abstract createProduct(product: CreateProductDto): Promise<ProductEntity>;
  abstract updateProduct(product: UpdateProductDto): Promise<ProductEntity>;
  abstract deleteProduct(id: DeleteProductByIdDto): Promise<ProductEntity>;
  abstract getProductById(id: GetProductByIdDto): Promise<ProductEntity>;
  abstract searchProducts(searchProductsDto: SearchProductsDto): Promise<{
    products: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

