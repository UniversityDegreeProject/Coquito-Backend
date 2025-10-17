import { DeleteProductByIdSchema, deleteProductByIdSchema } from "../../schemas/product/delete-product-by-id-validator.schema";

export class DeleteProductByIdDto {
  constructor(
    public readonly id: DeleteProductByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, DeleteProductByIdDto?] {
    const result = deleteProductByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new DeleteProductByIdDto(id)];
  }
}

