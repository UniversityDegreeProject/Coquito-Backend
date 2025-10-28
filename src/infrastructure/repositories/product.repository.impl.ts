import { 
  ProductEntity, 
  ProductDatasource, 
  ProductRepository, 
  CreateProductDto, 
  UpdateProductDto, 
  GetProductByIdDto, 
  DeleteProductByIdDto,
  PaginateResponse, 
} from "../../domain";
import { GetProductOptionalFiltersDto } from "../../domain/dto/product/get-product-optional-filters.dto";

export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    private readonly productDatasource: ProductDatasource
  ) {}

  getProducts(getProductOptionalFiltersDto: GetProductOptionalFiltersDto): Promise<PaginateResponse<ProductEntity>> {
    return this.productDatasource.getProducts(getProductOptionalFiltersDto);
  }

  createProduct(product: CreateProductDto): Promise<ProductEntity> {
    return this.productDatasource.createProduct(product);
  }

  updateProduct(product: UpdateProductDto): Promise<ProductEntity> {
    return this.productDatasource.updateProduct(product);
  }

  deleteProduct(id: DeleteProductByIdDto): Promise<ProductEntity> {
    return this.productDatasource.deleteProduct(id);
  }

  getProductById(id: GetProductByIdDto): Promise<ProductEntity> {
    return this.productDatasource.getProductById(id);
  }

}

