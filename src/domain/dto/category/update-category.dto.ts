import { UpdateCategorySchema, updateCategorySchema } from "../../schemas/category/update-category-validator.schema";

export class UpdateCategoryDto {
  constructor(
    public readonly id: UpdateCategorySchema["id"],
    public readonly name: UpdateCategorySchema["name"],
    public readonly description: UpdateCategorySchema["description"],
    public readonly status: UpdateCategorySchema["status"],
    public readonly updatedAt: UpdateCategorySchema["updatedAt"]
  ) {}

  /**
   * Retorna solo los campos que tienen valor (excluyendo el ID)
   * Útil para hacer updates parciales en Prisma
   */
  get values() {
    const returnObj: { [key: string]: any } = {};
    if (this.name !== undefined) returnObj.name = this.name;
    if (this.description !== undefined) returnObj.description = this.description;
    if (this.status !== undefined) returnObj.status = this.status;
    if (this.updatedAt !== undefined) returnObj.updatedAt = this.updatedAt;
    return returnObj;
  }

  public static create(dto: { [key: string]: any }): [string?, UpdateCategoryDto?] {
    const result = updateCategorySchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id, name, description, status, updatedAt } = result.data;
    return [undefined, new UpdateCategoryDto(id, name, description, status, updatedAt)];
  }
}

