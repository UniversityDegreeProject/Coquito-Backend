import { prismaClient } from "../../data/postgres";
import { 
  CategoryDatasource, 
  CategoryEntity, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  GetCategoryByIdDto, 
  DeleteCategoryByIdDto, 
  SearchCategoriesDto,
  HttpCustomErrors 
} from "../../domain";

export class CategoryDatasourceImpl implements CategoryDatasource {
  
  // * Obtener todas las categorías
  async getCategories(): Promise<CategoryEntity[]> {
    const categories = await prismaClient.category.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return categories.map(category => CategoryEntity.mapFromPrisma(category));
  }

  // * Obtener categoría por nombre
  async getCategoryByName(name: string): Promise<CategoryEntity> {
    const category = await prismaClient.category.findUnique({
      where: { name },
    });

    if (!category) throw HttpCustomErrors.notFound("Categoría no encontrada");

    return CategoryEntity.mapFromPrisma(category);
  }

  // * Obtener categoría por ID
  async getCategoryById(id: GetCategoryByIdDto): Promise<CategoryEntity> {
    const category = await prismaClient.category.findUnique({
      where: { id: id.id },
    });

    if (!category) throw HttpCustomErrors.notFound("Categoría no encontrada");

    return CategoryEntity.mapFromPrisma(category);
  }

  // * Crear categoría
  async createCategory(category: CreateCategoryDto): Promise<CategoryEntity> {
    const { name, description, status } = category;

    //? Verificar que el nombre no esté en uso
    const existingCategory = await prismaClient.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      throw HttpCustomErrors.badRequest("El nombre de la categoría ya está en uso");
    }

    //? Crear categoría
    const newCategory = await prismaClient.category.create({
      data: {
        name,
        description: description ?? null,
        status: status ?? "Activo",
      },
    });

    return CategoryEntity.mapFromPrisma(newCategory);
  }

  // * Actualizar categoría
  async updateCategory(category: UpdateCategoryDto): Promise<CategoryEntity> {
    const { id, name } = category;

    //? Verificar que la categoría existe
    const categoryToUpdate = await prismaClient.category.findUnique({
      where: { id },
    });
    if (!categoryToUpdate) throw HttpCustomErrors.notFound("Categoría no encontrada");

    //? Validar que el nombre no esté en uso por OTRA categoría
    if (name) {
      const existingCategory = await prismaClient.category.findUnique({
        where: { name },
      });

      //? Solo lanzar error si el nombre pertenece a OTRA categoría (no a la categoría actual)
      if (existingCategory && existingCategory.id !== id) {
        throw HttpCustomErrors.badRequest("El nombre de la categoría ya está en uso");
      }
    }

    //? Preparar datos de actualización
    const updateData = category.values;

    //? Actualizar categoría
    const updatedCategory = await prismaClient.category.update({
      where: { id },
      data: updateData,
    });

    return CategoryEntity.mapFromPrisma(updatedCategory);
  }

  // * Eliminar categoría
  async deleteCategory(id: DeleteCategoryByIdDto): Promise<CategoryEntity> {
    const categoryToDelete = await prismaClient.category.findUnique({
      where: { id: id.id },
      include: {
        products: true
      }
    });

    if (!categoryToDelete) throw HttpCustomErrors.notFound("Categoría no encontrada");

    //? Verificar si tiene productos asociados
    if (categoryToDelete.products.length > 0) {
      throw HttpCustomErrors.badRequest(
        `No se puede eliminar la categoría porque tiene ${categoryToDelete.products.length} producto(s) asociado(s)`
      );
    }

    const category = await prismaClient.category.delete({
      where: { id: id.id },
    });

    return CategoryEntity.mapFromPrisma(category);
  }

  // * Buscar categorías con filtros
  async searchCategories(searchCategoriesDto: SearchCategoriesDto): Promise<{
    categories: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, status, page, limit } = searchCategoriesDto;

    //? Construir el objeto where para Prisma
    const where: any = {};

    //? Búsqueda general (name, description)
    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    //? Filtro por estado
    if (status) {
      where.status = status;
    }

    //? Paginación
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prismaClient.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prismaClient.category.count({ where }),
    ]);

    //? Calcular total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      categories: categories.map(category => CategoryEntity.mapFromPrisma(category)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

