import { GetCategoriesOptionalFiltersDto } from "../../dto/category/get-categories-optional-filters.dto";
import { CategoryEntity } from "../../entities/category.entity";
import { PaginateResponse } from "../../interfaces/shared/paginated-response.interface";
import { CategoryRepository } from "../../repositories/category.repository";


export interface GetCategoriesOptionalFiltersUseCase {
  execute(getCategoriesOptionalFiltersDto: GetCategoriesOptionalFiltersDto): Promise<PaginateResponse<CategoryEntity>>;
}

export class GetCategoriesOptionalFiltersUseCaseImpl implements GetCategoriesOptionalFiltersUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository
  ) {}

  execute(getCategoriesOptionalFiltersDto: GetCategoriesOptionalFiltersDto): Promise<PaginateResponse<CategoryEntity>> {
    return this.categoryRepository.getCategories(getCategoriesOptionalFiltersDto);
  }
}