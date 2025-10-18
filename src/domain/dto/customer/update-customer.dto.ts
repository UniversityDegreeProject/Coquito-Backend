import { UpdateCustomerSchema, updateCustomerSchema } from "../../schemas/customer/update-customer-validator.schema";

export class UpdateCustomerDto {
  constructor(
    public readonly id: UpdateCustomerSchema["id"],
    public readonly firstName: UpdateCustomerSchema["firstName"],
    public readonly lastName: UpdateCustomerSchema["lastName"],
    public readonly email: UpdateCustomerSchema["email"],
    public readonly phone: UpdateCustomerSchema["phone"],
    public readonly address: UpdateCustomerSchema["address"],
    public readonly password: UpdateCustomerSchema["password"],
    public readonly type: UpdateCustomerSchema["type"],
    public readonly updatedAt: UpdateCustomerSchema["updatedAt"]
  ) {}

  /**
   * Retorna solo los campos que tienen valor (excluyendo el ID)
   * Útil para hacer updates parciales en Prisma
   */
  get values() {
    const returnObj: { [key: string]: any } = {};
    if (this.firstName !== undefined) returnObj.firstName = this.firstName;
    if (this.lastName !== undefined) returnObj.lastName = this.lastName;
    if (this.email !== undefined) returnObj.email = this.email;
    if (this.phone !== undefined) returnObj.phone = this.phone;
    if (this.address !== undefined) returnObj.address = this.address;
    if (this.password !== undefined) returnObj.password = this.password;
    if (this.type !== undefined) returnObj.type = this.type;
    if (this.updatedAt !== undefined) returnObj.updatedAt = this.updatedAt;
    return returnObj;
  }

  public static create(dto: { [key: string]: any }): [string?, UpdateCustomerDto?] {
    const result = updateCustomerSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id, firstName, lastName, email, phone, address, password, type, updatedAt } = result.data;
    return [undefined, new UpdateCustomerDto(id, firstName, lastName, email, phone, address, password, type, updatedAt)];
  }
}

