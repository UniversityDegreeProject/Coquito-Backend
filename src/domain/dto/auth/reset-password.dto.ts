import { ResetPasswordSchema, resetPasswordSchema } from "../../schemas";

export class ResetPasswordDto {
  constructor(
    public readonly token: ResetPasswordSchema["token"],
    public readonly newPassword: ResetPasswordSchema["newPassword"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, ResetPasswordDto?] {
    const result = resetPasswordSchema.safeParse(dto);
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { token, newPassword } = result.data;
    return [undefined, new ResetPasswordDto(token, newPassword)];
  }
}

