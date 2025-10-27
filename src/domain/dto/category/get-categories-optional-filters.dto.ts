import { GetCategoriesOptionalFiltersSchema, getCategoriesOptionalFiltersSchema } from "../../schemas/category/get-categories-optional-filters-validator.schema";

export class GetCategoriesOptionalFiltersDto {
  constructor(
    public readonly search: GetCategoriesOptionalFiltersSchema["search"],
    public readonly status: GetCategoriesOptionalFiltersSchema["status"],
    public readonly page: GetCategoriesOptionalFiltersSchema["page"],
    public readonly limit: GetCategoriesOptionalFiltersSchema["limit"],
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetCategoriesOptionalFiltersDto?] {
    const result = getCategoriesOptionalFiltersSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { search, status, page, limit } = result.data;
    return [undefined, new GetCategoriesOptionalFiltersDto(search, status, page, limit)];
  }
}