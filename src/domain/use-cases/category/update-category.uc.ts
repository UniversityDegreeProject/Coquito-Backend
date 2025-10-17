import { CategoryEntity } from "../../entities/category.entity";
import { UpdateCategoryDto } from "../../dto/category/update-category.dto";
import { CategoryRepository } from "../../repositories/category.repository";

interface UpdateCategoryUseCase {
  execute(category: UpdateCategoryDto): Promise<CategoryEntity>;
}

export class UpdateCategoryUseCaseImpl implements UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(category: UpdateCategoryDto): Promise<CategoryEntity> {
    return this.categoryRepository.updateCategory(category);
  }
}

