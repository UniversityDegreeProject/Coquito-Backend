import { GetUserByEmailSchema, getUserByEmailSchema } from "../../schemas";

export class GetUserByEmailDto {
  constructor(
    public readonly email: GetUserByEmailSchema["email"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetUserByEmailDto?] {
    const result = getUserByEmailSchema.safeParse(dto);
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { email } = result.data;
    return [undefined, new GetUserByEmailDto(email)];
  }
}