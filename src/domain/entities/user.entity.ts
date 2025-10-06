import { HttpCustomErrors } from "../errors/http-custom-errors";


export class UserEntity {

  constructor(
    public id: string,
    public username: string,
    public email: string,
    public emailVerified: boolean,
    public password: string,
    public firstName: string,
    public lastName: string,
    public phone: string,
    public role: string,
    public status: string,
    public createdAt: Date,
    public updatedAt?: Date | null,
  ) {};


  public static mapFromPrisma( prismaUser: {[key:string]: any} ): UserEntity {
    const { id, username, email, emailVerified, password, firstName, lastName, phone, role, status, createdAt, updatedAt } = prismaUser;
    
    if (!id) throw HttpCustomErrors.badRequest("id is required");
    if (!email) throw HttpCustomErrors.badRequest("email is required");
    if (!username) throw HttpCustomErrors.badRequest("username is required");
    if (emailVerified === undefined) throw HttpCustomErrors.badRequest("emailVerified is required");
    if (!password) throw HttpCustomErrors.badRequest("password is required");
    if (!firstName) throw HttpCustomErrors.badRequest("firstName is required");
    if (!lastName) throw HttpCustomErrors.badRequest("lastName is required");
    if (!role) throw HttpCustomErrors.badRequest("role is required");
    if (!status) throw HttpCustomErrors.badRequest("status is required");

    // CreatedAt por defecto es la fecha actual
    const createdAtDate = createdAt ? new Date(createdAt) : new Date();

    let updatedAtDate: Date | null = null;
    if (updatedAt) {
      updatedAtDate = new Date(updatedAt);
      if (isNaN(updatedAtDate.getTime()) || updatedAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("updatedAt is not a valid date");
      }
    }

    return new UserEntity(id, username, email, emailVerified, password, firstName, lastName, phone, role, status, createdAtDate, updatedAtDate);
  }

};