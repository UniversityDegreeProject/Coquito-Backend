import {
  SearchStockMovementsSchema,
  searchStockMovementsSchema,
} from "../../schemas/stock-movement/search-stock-movements-validator.schema";

export class SearchStockMovementsDto {
  constructor(
    public readonly productId: SearchStockMovementsSchema["productId"],
    public readonly userId: SearchStockMovementsSchema["userId"],
    public readonly type: SearchStockMovementsSchema["type"],
    public readonly startDate: SearchStockMovementsSchema["startDate"],
    public readonly endDate: SearchStockMovementsSchema["endDate"],
    public readonly page: SearchStockMovementsSchema["page"] = 1,
    public readonly limit: SearchStockMovementsSchema["limit"] = 10
  ) {}

  public static create(dto: { [key: string]: any }): [string?, SearchStockMovementsDto?] {
    const result = searchStockMovementsSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { productId, userId, type, startDate, endDate, page, limit } = result.data;
    return [
      undefined,
      new SearchStockMovementsDto(productId, userId, type, startDate, endDate, page, limit),
    ];
  }
}

