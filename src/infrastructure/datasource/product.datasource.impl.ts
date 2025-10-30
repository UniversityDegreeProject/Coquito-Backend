import { prismaClient } from "../../data/postgres";
import { 
  ProductDatasource, 
  ProductEntity, 
  CreateProductDto, 
  UpdateProductDto, 
  GetProductByIdDto, 
  DeleteProductByIdDto, 
  HttpCustomErrors,
  PaginateResponse,
  GetProductOptionalFiltersDto, 
} from "../../domain";

export class ProductDatasourceImpl implements ProductDatasource {


  constructor() {
    
  }

  private generateUrl(search: string | undefined, categoryId: string | undefined, status: string | undefined, minStock: number | undefined, page: number, limit: number): string {

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId) params.append("categoryId", categoryId);
    if (status) params.append("status", status);
    if (minStock) params.append("minStock", minStock.toString());
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return `/products?${params.toString()}`;
  }  
  // * Obtener todos los productos
  async getProducts(getProductOptionalFiltersDto: GetProductOptionalFiltersDto): Promise<PaginateResponse<ProductEntity>> {


    const { search, categoryId, status, minStock, page, limit } = getProductOptionalFiltersDto;

    // const where: any = {};

    // if (search && search.trim() !== "") {
    //   where.OR = [
    //     { name: { contains: search, mode: 'insensitive' } },
    //     { description: { contains: search, mode: 'insensitive' } },
    //     { sku: { contains: search, mode: 'insensitive' } },
    //   ];
    // }

    // if (categoryId) {
    //   where.categoryId = categoryId;
    // }

    // if (status) {
    //   where.status = status;
    // }
    
    // if (minStock) {
    //   where.stock = {
    //     lte: minStock
    //   };
    // } // ? termina el filtro por stock bajo

    const [ products, total] = await Promise.all([
      prismaClient.product.findMany({
        where: {
          ...(search && search.trim() !== "" && {
            OR: [
              { name : { contains: search, mode: 'insensitive' } },
              { description : { contains: search, mode: 'insensitive' } },
              { sku : { contains: search, mode: 'insensitive' } },
            ],
          }),

          ... ( categoryId && { 
            categoryId: categoryId
          }),

          ... ( status && {
            status : status
          }),

          ... ( minStock && {
             stock: {
              lte: minStock
            }
          }),

        },
        
        include: {
          category: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
      }),
      prismaClient.product.count({
        where: {
          ...(search && search.trim() !== "" && {
            OR: [
              { name : { contains: search, mode: 'insensitive' } },
              { description : { contains: search, mode: 'insensitive' } },
              { sku : { contains: search, mode: 'insensitive' } },
            ],
          }),

          ... ( categoryId && { 
            categoryId: categoryId
          }),

          ... ( status && {
            status : status
          }),

          ... ( minStock && {
             stock: {
              lte: minStock
            }
          }),

        },
      }),
    ]);

    return {
      data: products.map(product => ProductEntity.mapFromPrisma(product)),
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      nextPage: page < Math.ceil(total / limit) ? this.generateUrl(search, categoryId, status, minStock, page + 1, limit) : null,
      previousPage: page > 1 ? this.generateUrl(search, categoryId, status, minStock, page - 1, limit) : null,
    };
  }



  // * Obtener producto por ID
  async getProductById(id: GetProductByIdDto): Promise<ProductEntity> {
    const product = await prismaClient.product.findUnique({
      where: { id: id.id },
      include: {
        category: true
      }
    });

    if (!product) throw HttpCustomErrors.notFound("Producto no encontrado");

    return ProductEntity.mapFromPrisma(product);
  }

  // * Crear producto
  async createProduct(product: CreateProductDto): Promise<ProductEntity> {
    const { name, description, price, sku, stock, minStock, image, ingredients, categoryId, status } = product;

    //? Verificar que la categoría existe
    const categoryExists = await prismaClient.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      throw HttpCustomErrors.notFound("La categoría especificada no existe");
    }

    //? Verificar que el SKU no esté en uso (si se proporciona)
    if (sku) {
      const existingProduct = await prismaClient.product.findUnique({
        where: { sku }
      });

      if (existingProduct) {
        throw HttpCustomErrors.badRequest("El SKU ya está en uso");
      }
    }

    if(name){
      const existingProductByName = await prismaClient.product.findFirst({
        where: { name: { contains: name, mode: 'insensitive' } }
      });
      if(existingProductByName){
        throw HttpCustomErrors.badRequest("El producto ya existe");
      }
    }

    //? Crear producto
    const newProduct = await prismaClient.product.create({
      data: {
        name,
        description: description ?? null,
        price,
        sku: sku,
        stock: stock,
        minStock: minStock,
        image: image,
        ingredients: ingredients ?? null,
        categoryId,
        status: status,
      },
      include: {
        category: true
      }
    });

    return ProductEntity.mapFromPrisma(newProduct);
  }

  // * Actualizar producto
  async updateProduct(product: UpdateProductDto): Promise<ProductEntity> {
    const { id, sku, categoryId } = product;

    //? Verificar que el producto existe
    const productToUpdate = await prismaClient.product.findUnique({
      where: { id },
    });
    if (!productToUpdate) throw HttpCustomErrors.notFound("Producto no encontrado");

    //? Validar que el SKU no esté en uso por OTRO producto
    if (sku) {
      const existingProduct = await prismaClient.product.findUnique({
        where: { sku },
      });

      //? Solo lanzar error si el SKU pertenece a OTRO producto (no al producto actual)
      if (existingProduct && existingProduct.id !== id) {
        throw HttpCustomErrors.badRequest("El SKU ya está en uso");
      }
    }

    //? Validar que la categoría existe (si se proporciona)
    if (categoryId) {
      const categoryExists = await prismaClient.category.findUnique({
        where: { id: categoryId }
      });

      if (!categoryExists) {
        throw HttpCustomErrors.notFound("La categoría especificada no existe");
      }
    }

    //? Preparar datos de actualización
    const updateData = product.values;

    //? Actualizar producto
    const updatedProduct = await prismaClient.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    return ProductEntity.mapFromPrisma(updatedProduct);
  }

  // * Eliminar producto
  async deleteProduct(id: DeleteProductByIdDto): Promise<ProductEntity> {
    const productToDelete = await prismaClient.product.findUnique({
      where: { id: id.id },
      include: {
        orderItems: true,
        category: true
      }
    });

    if (!productToDelete) throw HttpCustomErrors.notFound("Producto no encontrado");

    //? Verificar si tiene items de orden asociados
    if (productToDelete.orderItems.length > 0) {
      throw HttpCustomErrors.badRequest(
        `No se puede eliminar el producto porque tiene ${productToDelete.orderItems.length} orden(es) asociada(s)`
      );
    }

    const product = await prismaClient.product.delete({
      where: { id: id.id },
      include: {
        category: true
      }
    });

    return ProductEntity.mapFromPrisma(product);
  }

  
}

