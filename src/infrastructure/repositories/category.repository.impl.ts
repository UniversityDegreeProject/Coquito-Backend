import { 
  CategoryEntity, 
  CategoryDatasource, 
  CategoryRepository, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  GetCategoryByIdDto, 
  DeleteCategoryByIdDto, 
  SearchCategoriesDto 
} from "../../domain";

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    private readonly categoryDatasource: CategoryDatasource
  ) {}

  getCategories(): Promise<CategoryEntity[]> {
    return this.categoryDatasource.getCategories();
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

  getCategoryByName(name: string): Promise<CategoryEntity> {
    return this.categoryDatasource.getCategoryByName(name);
  }

  searchCategories(searchCategoriesDto: SearchCategoriesDto): Promise<{
    categories: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.categoryDatasource.searchCategories(searchCategoriesDto);
  }
}

