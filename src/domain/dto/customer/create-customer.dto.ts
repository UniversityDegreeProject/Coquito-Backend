import { CreateCustomerSchema, createCustomerSchema } from "../../schemas/customer/create-customer-validator.schema";

export class CreateCustomerDto {
  constructor(
    public readonly firstName: CreateCustomerSchema["firstName"],
    public readonly lastName: CreateCustomerSchema["lastName"],
    public readonly email: CreateCustomerSchema["email"],
    public readonly phone: CreateCustomerSchema["phone"],
    public readonly address: CreateCustomerSchema["address"],
    public readonly type: CreateCustomerSchema["type"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CreateCustomerDto?] {
    const result = createCustomerSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { firstName, lastName, email, phone, address, type } = result.data;
    return [undefined, new CreateCustomerDto(firstName, lastName, email, phone, address, type)];
  }
}

