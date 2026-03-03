import { prismaClient } from "../../data/postgres";
import {
  CategoryDatasource,
  CategoryEntity,
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoryByIdDto,
  DeleteCategoryByIdDto,
  HttpCustomErrors,
  PaginateResponse,
} from "../../domain";
import { GetCategoriesOptionalFiltersDto } from "../../domain/dto/category/get-categories-optional-filters.dto";

export class CategoryDatasourceImpl implements CategoryDatasource {
  constructor() {}

  private generateUrl(
    search: string | undefined,
    status: string | undefined,
    page: number,
    limit: number,
  ): string {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return `/categories?${params.toString()}`;
  }

  // * Obtener todas las categorías
  async getCategories(
    getCategoriesOptionalFiltersDto: GetCategoriesOptionalFiltersDto,
  ): Promise<PaginateResponse<CategoryEntity>> {
    const { search, status, page, limit } = getCategoriesOptionalFiltersDto;

    const where: any = {};

    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [categories, total] = await Promise.all([
      prismaClient.category.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.category.count({ where }),
    ]);

    return {
      data: categories.map((category) =>
        CategoryEntity.mapFromPrisma(category),
      ),
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      nextPage:
        page < Math.ceil(total / limit)
          ? this.generateUrl(search, status, page + 1, limit)
          : null,
      previousPage:
        page > 1 ? this.generateUrl(search, status, page - 1, limit) : null,
    };
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
      where: { name },
    });

    if (existingCategory) {
      throw HttpCustomErrors.badRequest(
        "El nombre de la categoría ya está en uso",
      );
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
    if (!categoryToUpdate)
      throw HttpCustomErrors.notFound("Categoría no encontrada");

    //? Validar que el nombre no esté en uso por OTRA categoría
    if (name) {
      const existingCategory = await prismaClient.category.findUnique({
        where: { name },
      });

      //? Solo lanzar error si el nombre pertenece a OTRA categoría (no a la categoría actual)
      if (existingCategory && existingCategory.id !== id) {
        throw HttpCustomErrors.badRequest(
          "El nombre de la categoría ya está en uso",
        );
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
        products: true,
      },
    });

    if (!categoryToDelete)
      throw HttpCustomErrors.notFound("Categoría no encontrada");

    //? Verificar si tiene productos asociados
    if (categoryToDelete.products.length > 0) {
      throw HttpCustomErrors.badRequest(
        `No se puede eliminar la categoría porque tiene ${categoryToDelete.products.length} producto(s) asociado(s)`,
      );
    }

    const category = await prismaClient.category.delete({
      where: { id: id.id },
    });

    return CategoryEntity.mapFromPrisma(category);
  }
}
