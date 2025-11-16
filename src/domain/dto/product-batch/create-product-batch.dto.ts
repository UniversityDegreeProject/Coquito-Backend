import { 
  CreateProductBatchSchema, 
  createProductBatchSchema 
} from "../../schemas/product-batch/create-product-batch-validator.schema";

export class CreateProductBatchDto {
  constructor(
    public readonly productId: CreateProductBatchSchema["productId"],
    public readonly weight: CreateProductBatchSchema["weight"],
    public readonly unitPrice: CreateProductBatchSchema["unitPrice"],
    public readonly expirationDate: CreateProductBatchSchema["expirationDate"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CreateProductBatchDto?] {
    const result = createProductBatchSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { productId, weight, unitPrice, expirationDate } = result.data;
    return [undefined, new CreateProductBatchDto(productId, weight, unitPrice, expirationDate)];
  }
}

