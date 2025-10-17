import { CategoryEntity } from "../../entities/category.entity";
import { GetCategoryByIdDto } from "../../dto/category/get-category-by-id.dto";
import { CategoryRepository } from "../../repositories/category.repository";

interface GetCategoryByIdUseCase {
  execute(id: GetCategoryByIdDto): Promise<CategoryEntity>;
}

export class GetCategoryByIdUseCaseImpl implements GetCategoryByIdUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(id: GetCategoryByIdDto): Promise<CategoryEntity> {
    return this.categoryRepository.getCategoryById(id);
  }
}

