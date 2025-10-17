import { DeleteCategoryByIdSchema, deleteCategoryByIdSchema } from "../../schemas/category/delete-category-by-id-validator.schema";

export class DeleteCategoryByIdDto {
  constructor(
    public readonly id: DeleteCategoryByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, DeleteCategoryByIdDto?] {
    const result = deleteCategoryByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new DeleteCategoryByIdDto(id)];
  }
}

