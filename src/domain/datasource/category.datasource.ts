import { CategoryEntity } from "../entities/category.entity";
import { CreateCategoryDto } from "../dto/category/create-category.dto";
import { UpdateCategoryDto } from "../dto/category/update-category.dto";
import { GetCategoryByIdDto } from "../dto/category/get-category-by-id.dto";
import { DeleteCategoryByIdDto } from "../dto/category/delete-category-by-id.dto";
import { SearchCategoriesDto } from "../dto/category/search-categories.dto";

export abstract class CategoryDatasource {
  abstract getCategories(): Promise<CategoryEntity[]>;
  abstract createCategory(category: CreateCategoryDto): Promise<CategoryEntity>;
  abstract updateCategory(category: UpdateCategoryDto): Promise<CategoryEntity>;
  abstract deleteCategory(id: DeleteCategoryByIdDto): Promise<CategoryEntity>;
  abstract getCategoryById(id: GetCategoryByIdDto): Promise<CategoryEntity>;
  abstract getCategoryByName(name: string): Promise<CategoryEntity>;
  abstract searchCategories(searchCategoriesDto: SearchCategoriesDto): Promise<{
    categories: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

