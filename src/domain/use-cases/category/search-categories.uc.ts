import { CategoryEntity } from "../../entities/category.entity";
import { SearchCategoriesDto } from "../../dto/category/search-categories.dto";
import { CategoryRepository } from "../../repositories/category.repository";

interface SearchCategoriesUseCase {
  execute(searchCategoriesDto: SearchCategoriesDto): Promise<{
    categories: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export class SearchCategoriesUseCaseImpl implements SearchCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(searchCategoriesDto: SearchCategoriesDto): Promise<{
    categories: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.categoryRepository.searchCategories(searchCategoriesDto);
  }
}

