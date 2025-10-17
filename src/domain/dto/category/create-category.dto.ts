import { CreateCategorySchema, createCategorySchema } from "../../schemas/category/create-category-validator.schema";

export class CreateCategoryDto {
  constructor(
    public readonly name: CreateCategorySchema["name"],
    public readonly description: CreateCategorySchema["description"],
    public readonly status: CreateCategorySchema["status"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CreateCategoryDto?] {
    const result = createCategorySchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { name, description, status } = result.data;
    return [undefined, new CreateCategoryDto(name, description, status)];
  }
}

