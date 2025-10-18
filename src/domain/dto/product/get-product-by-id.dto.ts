import { GetProductByIdSchema, getProductByIdSchema } from "../../schemas/product/get-product-by-id-validator.schema";

export class GetProductByIdDto {
  constructor(
    public readonly id: GetProductByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetProductByIdDto?] {
    const result = getProductByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new GetProductByIdDto(id)];
  }
}

