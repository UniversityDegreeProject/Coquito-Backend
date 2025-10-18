import { HttpCustomErrors } from "../errors/http-custom-errors";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";

export class StockMovementEntity {
  constructor(
    public id: string,
    public productId: string,
    public userId: string,
    public type: string,
    public quantity: number,
    public previousStock: number,
    public newStock: number,
    public reason: string | null,
    public reference: string | null,
    public notes: string | null,
    public createdAt: Date,
    public user?: UserEntity,
    public product?: ProductEntity
  ) {}

  public static mapFromPrisma(prismaStockMovement: { [key: string]: any }): StockMovementEntity {
    const {
      id,
      productId,
      userId,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      reference,
      notes,
      createdAt,
      user,
      product
    } = prismaStockMovement;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!productId) throw HttpCustomErrors.badRequest("productId es requerido");
    if (!userId) throw HttpCustomErrors.badRequest("userId es requerido");
    if (!type) throw HttpCustomErrors.badRequest("type es requerido");
    if (quantity === undefined || quantity === null) throw HttpCustomErrors.badRequest("quantity es requerido");
    if (previousStock === undefined || previousStock === null) throw HttpCustomErrors.badRequest("previousStock es requerido");
    if (newStock === undefined || newStock === null) throw HttpCustomErrors.badRequest("newStock es requerido");

    //? Validar que createdAt sea una fecha válida
    let createdAtDate: Date;
    if (createdAt) {
      createdAtDate = new Date(createdAt);
      if (isNaN(createdAtDate.getTime()) || createdAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("createdAt no es una fecha válida");
      }
    } else {
      createdAtDate = new Date();
    }

    //? Mapear user si existe
    const userEntity = user ? UserEntity.mapFromPrisma(user) : undefined;

    //? Mapear product si existe
    const productEntity = product ? ProductEntity.mapFromPrisma(product) : undefined;

    return new StockMovementEntity(
      id,
      productId,
      userId,
      type,
      quantity,
      previousStock,
      newStock,
      reason ?? null,
      reference ?? null,
      notes ?? null,
      createdAtDate,
      userEntity,
      productEntity
    );
  }
}

