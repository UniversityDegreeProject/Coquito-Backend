import { 
  DeleteBatchSchema, 
  deleteBatchSchema 
} from "../../schemas/product-batch/delete-batch-validator.schema";

export class DeleteBatchDto {
  constructor(
    public readonly batchId: DeleteBatchSchema["batchId"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, DeleteBatchDto?] {
    const result = deleteBatchSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { batchId } = result.data;
    return [undefined, new DeleteBatchDto(batchId)];
  }
}

