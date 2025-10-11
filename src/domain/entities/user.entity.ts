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
    
    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!email) throw HttpCustomErrors.badRequest("email es requerido");
    if (!username) throw HttpCustomErrors.badRequest("username es requerido");
    if (emailVerified === undefined) throw HttpCustomErrors.badRequest("emailVerified es requerido");
    if (!password) throw HttpCustomErrors.badRequest("password es requerido");
    if (!firstName) throw HttpCustomErrors.badRequest("nombre es requerido");
    if (!lastName) throw HttpCustomErrors.badRequest("apellido es requerido");
    if (!role) throw HttpCustomErrors.badRequest("role es requerido");
    if (!status) throw HttpCustomErrors.badRequest("status es requerido");

    //? createdAt por defecto es la fecha actual en caso de que no se proporcione
    let createdAtDate: Date = new Date();
    if (createdAt){
      createdAtDate = new Date(createdAt);
      if (isNaN(createdAtDate.getTime()) || createdAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("createdAt no es una fecha valida");
      }
    }

    //? updatedAt por defecto es null en caso de que no se proporcione
    let updatedAtDate: Date | null = null;
    if (updatedAt) {
      updatedAtDate = new Date(updatedAt);
      if (isNaN(updatedAtDate.getTime()) || updatedAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("updatedAt no es una fecha valida");
      }
    }

    return new UserEntity(id, username, email, emailVerified, password, firstName, lastName, phone, role, status, createdAtDate, updatedAtDate);
  }

};