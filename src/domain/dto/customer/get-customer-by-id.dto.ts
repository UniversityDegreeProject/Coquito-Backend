import { GetCustomerByIdSchema, getCustomerByIdSchema } from "../../schemas/customer/get-customer-by-id-validator.schema";

export class GetCustomerByIdDto {
  constructor(
    public readonly id: GetCustomerByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetCustomerByIdDto?] {
    const result = getCustomerByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new GetCustomerByIdDto(id)];
  }
}

