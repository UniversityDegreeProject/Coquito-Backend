import {
  GetStockMovementsByProductSchema,
  getStockMovementsByProductSchema,
} from "../../schemas/stock-movement/get-stock-movements-by-product-validator.schema";

export class GetStockMovementsByProductDto {
  constructor(
    public readonly productId: GetStockMovementsByProductSchema["productId"],
    public readonly page: GetStockMovementsByProductSchema["page"] = 1,
    public readonly limit: GetStockMovementsByProductSchema["limit"] = 20
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetStockMovementsByProductDto?] {
    const result = getStockMovementsByProductSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { productId, page, limit } = result.data;
    return [undefined, new GetStockMovementsByProductDto(productId, page, limit)];
  }
}

