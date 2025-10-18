import {
  GetStockMovementByIdSchema,
  getStockMovementByIdSchema,
} from "../../schemas/stock-movement/get-stock-movement-by-id-validator.schema";

export class GetStockMovementByIdDto {
  constructor(public readonly id: GetStockMovementByIdSchema["id"]) {}

  public static create(dto: { [key: string]: any }): [string?, GetStockMovementByIdDto?] {
    const result = getStockMovementByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new GetStockMovementByIdDto(id)];
  }
}

