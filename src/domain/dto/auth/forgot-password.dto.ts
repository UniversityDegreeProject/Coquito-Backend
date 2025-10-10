import { ForgotPasswordSchema, forgotPasswordSchema } from "../../schemas";

export class ForgotPasswordDto {
  constructor(
    public readonly email: ForgotPasswordSchema["email"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, ForgotPasswordDto?] {
    const result = forgotPasswordSchema.safeParse(dto);
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { email } = result.data;
    return [undefined, new ForgotPasswordDto(email)];
  }
}

