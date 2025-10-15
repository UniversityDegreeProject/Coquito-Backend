import { RegisterUserSchema, createUserSchema } from "../../schemas";

export class RegisterUserDto {
  constructor(
    public readonly username: RegisterUserSchema["username"],
    public readonly email: RegisterUserSchema["email"],
    public readonly firstName: RegisterUserSchema["firstName"],
    public readonly lastName: RegisterUserSchema["lastName"],
    public readonly phone: RegisterUserSchema["phone"],
    public readonly role: RegisterUserSchema["role"],
    public readonly status: RegisterUserSchema["status"],
    public readonly password: RegisterUserSchema["password"],
  ) {}

  public static create(dto: { [key: string]: any }): [string?, RegisterUserDto?] {
    const result = createUserSchema.safeParse(dto);
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }


    const { username, email, password, firstName, lastName, phone, role, status } = result.data;

    return [undefined, new RegisterUserDto(username, email, firstName, lastName, phone, role, status, password)
    ];
  }
}