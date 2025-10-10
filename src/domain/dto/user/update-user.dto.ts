import { UpdateUserSchema, updateUserSchema } from "../../schemas/user/update-user-validator.schema";

export class UpdateUserDto {  
  constructor(
    public readonly id: UpdateUserSchema["id"],
    public readonly username: UpdateUserSchema["username"],
    public readonly emailVerified: UpdateUserSchema["emailVerified"],
    public readonly password: UpdateUserSchema["password"],
    public readonly email: UpdateUserSchema["email"],
    public readonly firstName: UpdateUserSchema["firstName"],
    public readonly lastName: UpdateUserSchema["lastName"],
    public readonly status: UpdateUserSchema["status"],
    public readonly role: UpdateUserSchema["role"],
    public readonly phone: UpdateUserSchema["phone"],
    public readonly updatedAt: UpdateUserSchema["updatedAt"],
  ){};

  /**
   * Retorna solo los campos que tienen valor (excluyendo el ID)
   * Útil para hacer updates parciales en Prisma
   */
  get values() {
    const returnObj: {[key: string]: any} = {};
    if (this.username !== undefined) returnObj.username = this.username;
    if (this.emailVerified !== undefined) returnObj.emailVerified = this.emailVerified;
    if (this.password !== undefined) returnObj.password = this.password;
    if (this.email !== undefined) returnObj.email = this.email;
    if (this.firstName !== undefined) returnObj.firstName = this.firstName;
    if (this.lastName !== undefined) returnObj.lastName = this.lastName;
    if (this.status !== undefined) returnObj.status = this.status;
    if (this.role !== undefined) returnObj.role = this.role;
    if (this.phone !== undefined) returnObj.phone = this.phone;
    if (this.updatedAt !== undefined) returnObj.updatedAt = this.updatedAt;
    return returnObj;
  }

  public static create(dto: {[key: string]: any}): [string?, UpdateUserDto?] {
    const result = updateUserSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id, email, firstName, lastName, phone, updatedAt, emailVerified, password, username, role, status } = result.data;
    return [undefined, new UpdateUserDto(id, username, emailVerified, password, email, firstName, lastName, status, role, phone, updatedAt)];
  }
}