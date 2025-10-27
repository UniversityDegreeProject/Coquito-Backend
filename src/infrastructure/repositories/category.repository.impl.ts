import { 
  CategoryEntity, 
  CategoryDatasource, 
  CategoryRepository, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  GetCategoryByIdDto, 
  DeleteCategoryByIdDto,
  GetCategoriesOptionalFiltersDto,
  PaginateResponse, 
} from "../../domain";

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    private readonly categoryDatasource: CategoryDatasource
  ) {}

  getCategories(getCategoriesOptionalFiltersDto: GetCategoriesOptionalFiltersDto): Promise<PaginateResponse<CategoryEntity>> {
    return this.categoryDatasource.getCategories(getCategoriesOptionalFiltersDto);
  }

  createCategory(category: CreateCategoryDto): Promise<CategoryEntity> {
    return this.categoryDatasource.createCategory(category);
  }

  updateCategory(category: UpdateCategoryDto): Promise<CategoryEntity> {
    return this.categoryDatasource.updateCategory(category);
  }

  deleteCategory(id: DeleteCategoryByIdDto): Promise<CategoryEntity> {
    return this.categoryDatasource.deleteCategory(id);
  }

  getCategoryById(id: GetCategoryByIdDto): Promise<CategoryEntity> {
    return this.categoryDatasource.getCategoryById(id);
  }



}

