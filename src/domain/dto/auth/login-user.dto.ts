import { LoginUserSchema, loginUserSchema } from "../../schemas";
export class LoginUserDto {
  constructor(
    public readonly username: LoginUserSchema["username"],
    public readonly password: LoginUserSchema["password"],
  ){}

  public static create(dto: {[key: string]: any}): [string?, LoginUserDto?] {
    const result = loginUserSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { username, password } = result.data;
    return [undefined, new LoginUserDto(username, password)];
  }
}