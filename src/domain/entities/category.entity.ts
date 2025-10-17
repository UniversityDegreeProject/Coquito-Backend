import { HttpCustomErrors } from "../errors/http-custom-errors";

export class CategoryEntity {
  constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public status: string,
    public createdAt: Date,
    public updatedAt?: Date | null
  ) {}

  public static mapFromPrisma(prismaCategory: { [key: string]: any }): CategoryEntity {
    const { id, name, description, status, createdAt, updatedAt } = prismaCategory;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!name) throw HttpCustomErrors.badRequest("name es requerido");
    if (!status) throw HttpCustomErrors.badRequest("status es requerido");

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

    return new CategoryEntity(
      id,
      name,
      description ?? null,
      status,
      createdAtDate,
      updatedAtDate
    );
  }
}

