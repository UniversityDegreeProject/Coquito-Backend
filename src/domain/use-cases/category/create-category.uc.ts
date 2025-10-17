import { CategoryEntity } from "../../entities/category.entity";
import { CreateCategoryDto } from "../../dto/category/create-category.dto";
import { CategoryRepository } from "../../repositories/category.repository";

interface CreateCategoryUseCase {
  execute(category: CreateCategoryDto): Promise<CategoryEntity>;
}

export class CreateCategoryUseCaseImpl implements CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(category: CreateCategoryDto): Promise<CategoryEntity> {
    return this.categoryRepository.createCategory(category);
  }
}

