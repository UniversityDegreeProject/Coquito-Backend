import { SearchCategoriesSchema, searchCategoriesSchema } from "../../schemas/category/search-categories-validator.schema";

export class SearchCategoriesDto {
  constructor(
    public readonly search: SearchCategoriesSchema["search"],
    public readonly status: SearchCategoriesSchema["status"],
    public readonly page: SearchCategoriesSchema["page"],
    public readonly limit: SearchCategoriesSchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, SearchCategoriesDto?] {
    const result = searchCategoriesSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { search, status, page, limit } = result.data;
    return [undefined, new SearchCategoriesDto(search, status, page, limit)];
  }
}

