import { HttpCustomErrors } from "../errors/http-custom-errors";

export class CustomerEntity {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public email: string | null,
    public phone: string | null,
    public address: string | null,
    public password: string,
    public type: string,
    public createdAt: Date,
    public updatedAt?: Date | null
  ) {}

  public static mapFromPrisma(prismaCustomer: { [key: string]: any }): CustomerEntity {
    const { 
      id, 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      password,
      type, 
      createdAt, 
      updatedAt 
    } = prismaCustomer;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!firstName) throw HttpCustomErrors.badRequest("firstName es requerido");
    if (!lastName) throw HttpCustomErrors.badRequest("lastName es requerido");
    if (!password) throw HttpCustomErrors.badRequest("password es requerido");
    if (!type) throw HttpCustomErrors.badRequest("type es requerido");

    //? createdAt por defecto es la fecha actual en caso de que no se proporcione
    let createdAtDate: Date = new Date();
    if (createdAt) {
      createdAtDate = new Date(createdAt);
      if (isNaN(createdAtDate.getTime()) || createdAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("createdAt no es una fecha válida");
      }
    }

    //? updatedAt por defecto es null en caso de que no se proporcione
    let updatedAtDate: Date | null = null;
    if (updatedAt) {
      updatedAtDate = new Date(updatedAt);
      if (isNaN(updatedAtDate.getTime()) || updatedAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("updatedAt no es una fecha válida");
      }
    }

    return new CustomerEntity(
      id,
      firstName,
      lastName,
      email ?? null,
      phone ?? null,
      address ?? null,
      password,
      type,
      createdAtDate,
      updatedAtDate
    );
  }
}

