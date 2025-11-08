import { 
  GetBatchesByProductSchema, 
  getBatchesByProductSchema 
} from "../../schemas/product-batch/get-batches-by-product-validator.schema";

export class GetBatchesByProductDto {
  constructor(
    public readonly productId: GetBatchesByProductSchema["productId"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetBatchesByProductDto?] {
    const result = getBatchesByProductSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { productId } = result.data;
    return [undefined, new GetBatchesByProductDto(productId)];
  }
}

