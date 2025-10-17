import { 
  ProductEntity, 
  ProductDatasource, 
  ProductRepository, 
  CreateProductDto, 
  UpdateProductDto, 
  GetProductByIdDto, 
  DeleteProductByIdDto, 
  SearchProductsDto 
} from "../../domain";

export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    private readonly productDatasource: ProductDatasource
  ) {}

  getProducts(): Promise<ProductEntity[]> {
    return this.productDatasource.getProducts();
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

  searchProducts(searchProductsDto: SearchProductsDto): Promise<{
    products: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.productDatasource.searchProducts(searchProductsDto);
  }
}

