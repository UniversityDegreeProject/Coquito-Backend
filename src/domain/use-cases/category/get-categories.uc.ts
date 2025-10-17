import { CategoryEntity } from "../../entities/category.entity";
import { CategoryRepository } from "../../repositories/category.repository";

interface GetCategoriesUseCase {
  execute(): Promise<CategoryEntity[]>;
}

export class GetCategoriesUseCaseImpl implements GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(): Promise<CategoryEntity[]> {
    return this.categoryRepository.getCategories();
  }
}

