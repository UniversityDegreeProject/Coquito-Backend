import { DeleteUserByIdSchema, deleteUserByIdSchema } from "../../schemas";


export class DeleteUserByIdDto {
  constructor(
    public readonly id: DeleteUserByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, DeleteUserByIdDto?] {
    const result = deleteUserByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new DeleteUserByIdDto(id)];
  }
}