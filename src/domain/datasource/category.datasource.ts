import { CategoryEntity } from "../entities/category.entity";
import { CreateCategoryDto } from "../dto/category/create-category.dto";
import { UpdateCategoryDto } from "../dto/category/update-category.dto";
import { GetCategoryByIdDto } from "../dto/category/get-category-by-id.dto";
import { DeleteCategoryByIdDto } from "../dto/category/delete-category-by-id.dto";
import { GetCategoriesOptionalFiltersDto } from "../dto/category/get-categories-optional-filters.dto";
import { PaginateResponse } from "../interfaces/shared/paginated-response.interface";

export abstract class CategoryDatasource {
  abstract getCategories(getCategoriesOptionalFiltersDto: GetCategoriesOptionalFiltersDto): Promise<PaginateResponse<CategoryEntity>>;
  abstract createCategory(category: CreateCategoryDto): Promise<CategoryEntity>;
  abstract updateCategory(category: UpdateCategoryDto): Promise<CategoryEntity>;
  abstract deleteCategory(id: DeleteCategoryByIdDto): Promise<CategoryEntity>;
  abstract getCategoryById(id: GetCategoryByIdDto): Promise<CategoryEntity>;

}

