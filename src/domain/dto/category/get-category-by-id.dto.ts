import { GetCategoryByIdSchema, getCategoryByIdSchema } from "../../schemas/category/get-category-by-id-validator.schema";

export class GetCategoryByIdDto {
  constructor(
    public readonly id: GetCategoryByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetCategoryByIdDto?] {
    const result = getCategoryByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new GetCategoryByIdDto(id)];
  }
}

