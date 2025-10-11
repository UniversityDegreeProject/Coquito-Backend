import { GetUserByIdSchema, getUserByIdSchema } from "../../schemas";

export class GetUserByIdDto {
  constructor(
    public readonly id: GetUserByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetUserByIdDto?] {
    const result = getUserByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new GetUserByIdDto(id)];
  }
}