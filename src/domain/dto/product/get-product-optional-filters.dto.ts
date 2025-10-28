import { GetProductsOptionalFiltersSchema, getProductsOptionalFiltersSchema } from "../../schemas/product/get-products-optional-filters-validator.schema";

export class GetProductOptionalFiltersDto {
  constructor(
    public readonly search: GetProductsOptionalFiltersSchema["search"],
    public readonly categoryId: GetProductsOptionalFiltersSchema["categoryId"],
    public readonly status: GetProductsOptionalFiltersSchema["status"],
    public readonly minStock: GetProductsOptionalFiltersSchema["minStock"],
    public readonly page: GetProductsOptionalFiltersSchema["page"],
    public readonly limit: GetProductsOptionalFiltersSchema["limit"],
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetProductOptionalFiltersDto?] {
    const result = getProductsOptionalFiltersSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }
    const { search, categoryId, status, minStock, page, limit } = result.data;
    return [undefined, new GetProductOptionalFiltersDto(search, categoryId, status, minStock, page, limit)];
  }
}