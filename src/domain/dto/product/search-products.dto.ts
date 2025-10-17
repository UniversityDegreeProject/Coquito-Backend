import { SearchProductsSchema, searchProductsSchema } from "../../schemas/product/search-products-validator.schema";

export class SearchProductsDto {
  constructor(
    public readonly search: SearchProductsSchema["search"],
    public readonly categoryId: SearchProductsSchema["categoryId"],
    public readonly status: SearchProductsSchema["status"],
    public readonly lowStock: SearchProductsSchema["lowStock"],
    public readonly page: SearchProductsSchema["page"],
    public readonly limit: SearchProductsSchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, SearchProductsDto?] {
    const result = searchProductsSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { search, categoryId, status, lowStock, page, limit } = result.data;
    return [undefined, new SearchProductsDto(search, categoryId, status, lowStock, page, limit)];
  }
}

