import {
  CreateStockMovementSchema,
  createStockMovementSchema,
} from "../../schemas/stock-movement/create-stock-movement-validator.schema";

export class CreateStockMovementDto {
  constructor(
    public readonly productId: CreateStockMovementSchema["productId"],
    public readonly userId: CreateStockMovementSchema["userId"],
    public readonly type: CreateStockMovementSchema["type"],
    public readonly quantity: CreateStockMovementSchema["quantity"],
    public readonly reason: CreateStockMovementSchema["reason"],
    public readonly reference: CreateStockMovementSchema["reference"],
    public readonly notes: CreateStockMovementSchema["notes"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CreateStockMovementDto?] {
    const result = createStockMovementSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { productId, userId, type, quantity, reason, reference, notes } = result.data;
    return [
      undefined,
      new CreateStockMovementDto(productId, userId, type, quantity, reason, reference, notes),
    ];
  }
}

