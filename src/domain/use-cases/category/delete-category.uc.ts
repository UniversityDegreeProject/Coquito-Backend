import { CategoryEntity } from "../../entities/category.entity";
import { DeleteCategoryByIdDto } from "../../dto/category/delete-category-by-id.dto";
import { CategoryRepository } from "../../repositories/category.repository";

interface DeleteCategoryUseCase {
  execute(id: DeleteCategoryByIdDto): Promise<CategoryEntity>;
}

export class DeleteCategoryUseCaseImpl implements DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(id: DeleteCategoryByIdDto): Promise<CategoryEntity> {
    return this.categoryRepository.deleteCategory(id);
  }
}

