import { DeleteCustomerByIdSchema, deleteCustomerByIdSchema } from "../../schemas/customer/delete-customer-by-id-validator.schema";

export class DeleteCustomerByIdDto {
  constructor(
    public readonly id: DeleteCustomerByIdSchema["id"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, DeleteCustomerByIdDto?] {
    const result = deleteCustomerByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id } = result.data;
    return [undefined, new DeleteCustomerByIdDto(id)];
  }
}

