import { z as zod } from "zod";

const updateUserSchema = zod.object({
  id: zod.string().uuid("Id inválido"),
  email: zod.string().email("Email inválido"),
  firstName: zod.string().min(1, "Nombre requerido"),
  lastName: zod.string().min(1, "Apellido requerido"),
  phone: zod.string().min(1, "Teléfono requerido"),
  updatedAt: zod.date().optional(),
});

type UpdateUserSchema = zod.infer<typeof updateUserSchema>;

export class UpdateUserDto {  
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string,
    public readonly updatedAt?: Date | null,
  ){};

  get values() {
    const returnObj: {[key: string]: any} = {};
    if (this.email) returnObj.email = this.email;
    if (this.firstName) returnObj.firstName = this.firstName;
    if (this.lastName) returnObj.lastName = this.lastName;
    if (this.phone) returnObj.phone = this.phone;
    if (this.updatedAt) returnObj.updatedAt = this.updatedAt;
    return returnObj;
  }

  public static create(dto: {[key: string]: any}): [string?, UpdateUserDto?] {
    const result = updateUserSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id, email, firstName, lastName, phone } = result.data;
    return [undefined, new UpdateUserDto(id, email, firstName, lastName, phone)];
  }
}