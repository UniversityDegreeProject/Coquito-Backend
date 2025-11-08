import { HttpCustomErrors } from "../errors/http-custom-errors";
import { ProductEntity } from "./product.entity";

export class ProductBatchEntity {
  constructor(
    public id: string,
    public productId: string,
    public batchCode: string,
    public weight: number,
    public unitPrice: number,
    public stock: number,
    public createdAt: Date,
    public updatedAt: Date | null,
    public product?: ProductEntity
  ) {}

  public static mapFromPrisma(prismaBatch: { [key: string]: any }): ProductBatchEntity {
    const {
      id,
      productId,
      batchCode,
      weight,
      unitPrice,
      stock,
      createdAt,
      updatedAt,
      product
    } = prismaBatch;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!productId) throw HttpCustomErrors.badRequest("productId es requerido");
    if (!batchCode) throw HttpCustomErrors.badRequest("batchCode es requerido");
    if (weight === undefined || weight === null) throw HttpCustomErrors.badRequest("weight es requerido");
    if (unitPrice === undefined || unitPrice === null) throw HttpCustomErrors.badRequest("unitPrice es requerido");
    if (stock === undefined || stock === null) throw HttpCustomErrors.badRequest("stock es requerido");

    //? Convertir Decimal de Prisma a number
    const weightNumber = typeof weight === 'object' && 'toNumber' in weight 
      ? weight.toNumber() 
      : Number(weight);

    const unitPriceNumber = typeof unitPrice === 'object' && 'toNumber' in unitPrice 
      ? unitPrice.toNumber() 
      : Number(unitPrice);

    //? Validar createdAt
    let createdAtDate: Date;
    if (createdAt) {
      createdAtDate = new Date(createdAt);
      if (isNaN(createdAtDate.getTime()) || createdAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("createdAt no es una fecha válida");
      }
    } else {
      createdAtDate = new Date();
    }

    //? Validar updatedAt
    let updatedAtDate: Date | null = null;
    if (updatedAt) {
      updatedAtDate = new Date(updatedAt);
      if (isNaN(updatedAtDate.getTime()) || updatedAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("updatedAt no es una fecha válida");
      }
    }

    //? Mapear producto si existe
    const productEntity = product ? ProductEntity.mapFromPrisma(product) : undefined;

    return new ProductBatchEntity(
      id,
      productId,
      batchCode,
      weightNumber,
      unitPriceNumber,
      stock,
      createdAtDate,
      updatedAtDate,
      productEntity
    );
  }
}

