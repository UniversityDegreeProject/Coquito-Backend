import { HttpCustomErrors } from "../errors/http-custom-errors";

export class SystemConfigEntity {
  constructor(
    public id: string,
    public key: string,
    public value: string,
    public description: string | null,
    public createdAt: Date,
    public updatedAt: Date | null
  ) {}

  // * Mapea un registro de Prisma a la entidad de dominio
  public static mapFromPrisma(prismaConfig: {
    [key: string]: any;
  }): SystemConfigEntity {
    const { id, key, value, description, createdAt, updatedAt } = prismaConfig;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!key) throw HttpCustomErrors.badRequest("key es requerido");
    if (typeof value === "undefined" || value === null) {
      throw HttpCustomErrors.badRequest("value es requerido");
    }

    const createdAtDate = new Date(createdAt ?? new Date());
    if (isNaN(createdAtDate.getTime())) {
      throw HttpCustomErrors.badRequest("createdAt no es una fecha válida");
    }

    let updatedAtDate: Date | null = null;
    if (updatedAt) {
      updatedAtDate = new Date(updatedAt);
      if (isNaN(updatedAtDate.getTime())) {
        throw HttpCustomErrors.badRequest("updatedAt no es una fecha válida");
      }
    }

    return new SystemConfigEntity(
      id,
      key,
      String(value),
      description ?? null,
      createdAtDate,
      updatedAtDate
    );
  }
}
