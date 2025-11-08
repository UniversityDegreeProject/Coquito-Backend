import { 
  UpdateBatchStockSchema, 
  updateBatchStockSchema 
} from "../../schemas/product-batch/update-batch-stock-validator.schema";

export class UpdateBatchStockDto {
  constructor(
    public readonly batchId: UpdateBatchStockSchema["batchId"],
    public readonly stock: UpdateBatchStockSchema["stock"],
    public readonly userId: UpdateBatchStockSchema["userId"],
    public readonly reason: UpdateBatchStockSchema["reason"],
    public readonly notes: UpdateBatchStockSchema["notes"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, UpdateBatchStockDto?] {
    const result = updateBatchStockSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { batchId, stock, userId, reason, notes } = result.data;
    return [undefined, new UpdateBatchStockDto(batchId, stock, userId, reason, notes)];
  }
}

