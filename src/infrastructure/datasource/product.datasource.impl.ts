import { prismaClient } from "../../data/postgres";
import { 
  ProductDatasource, 
  ProductEntity, 
  CreateProductDto, 
  UpdateProductDto, 
  GetProductByIdDto, 
  DeleteProductByIdDto, 
  SearchProductsDto,
  HttpCustomErrors 
} from "../../domain";

export class ProductDatasourceImpl implements ProductDatasource {
  
  // * Obtener todos los productos
  async getProducts(): Promise<ProductEntity[]> {
    const products = await prismaClient.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return products.map(product => ProductEntity.mapFromPrisma(product));
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

    //? Crear producto
    const newProduct = await prismaClient.product.create({
      data: {
        name,
        description: description ?? null,
        price,
        sku: sku ?? null,
        stock: stock ?? 0,
        minStock: minStock ?? 5,
        image: image ?? null,
        ingredients: ingredients ?? null,
        categoryId,
        status: status ?? "Disponible",
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

  // * Buscar productos con filtros
  async searchProducts(searchProductsDto: SearchProductsDto): Promise<{
    products: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, categoryId, status, lowStock, page, limit } = searchProductsDto;

    //? Construir el objeto where para Prisma
    const where: any = {};

    //? Búsqueda general (name, description, sku)
    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    //? Filtro por categoría
    if (categoryId) {
      where.categoryId = categoryId;
    }

    //? Filtro por estado
    if (status) {
      where.status = status;
    }

    //? Paginación
    const skip = (page - 1) * limit;

    //? Si se filtra por stock bajo, obtener productos y filtrar manualmente
    if (lowStock) {
      const allProducts = await prismaClient.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      //? Filtrar productos con stock <= minStock
      const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock);
      
      //? Aplicar paginación manualmente
      const total = lowStockProducts.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedProducts = lowStockProducts.slice(skip, skip + limit);

      return {
        products: paginatedProducts.map(product => ProductEntity.mapFromPrisma(product)),
        total,
        page,
        limit,
        totalPages,
      };
    }

    //? Búsqueda normal sin filtro de stock bajo
    const [products, total] = await Promise.all([
      prismaClient.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prismaClient.product.count({ where }),
    ]);

    //? Calcular total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      products: products.map(product => ProductEntity.mapFromPrisma(product)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

