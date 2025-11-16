import { HttpCustomErrors } from "../errors/http-custom-errors";
import { CategoryEntity } from "./category.entity";
import { ProductBatchEntity } from "./product-batch.entity";

export class ProductEntity {
  constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public price: number,
    public sku: string | null,
    public stock: number,
    public minStock: number,
    public image: string | null,
    public status: string,
    public ingredients: string | null,
    public categoryId: string,
    public isVariableWeight: boolean,
    public pricePerKg: number | null,
    public category?: CategoryEntity,
    public batches?: ProductBatchEntity[],
    public createdAt?: Date,
    public updatedAt?: Date | null
  ) {}

  public static mapFromPrisma(prismaProduct: { [key: string]: any }): ProductEntity {
    const { 
      id, 
      name, 
      description, 
      price, 
      sku, 
      stock, 
      minStock, 
      image, 
      status,
      ingredients,
      categoryId,
      isVariableWeight,
      pricePerKg,
      category,
      batches,
      createdAt, 
      updatedAt 
    } = prismaProduct;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!name) throw HttpCustomErrors.badRequest("name es requerido");
    if (price === undefined || price === null) throw HttpCustomErrors.badRequest("price es requerido");
    if (stock === undefined || stock === null) throw HttpCustomErrors.badRequest("stock es requerido");
    if (minStock === undefined || minStock === null) throw HttpCustomErrors.badRequest("minStock es requerido");
    if (!status) throw HttpCustomErrors.badRequest("status es requerido");
    if (!categoryId) throw HttpCustomErrors.badRequest("categoryId es requerido");
    if (isVariableWeight === undefined || isVariableWeight === null) throw HttpCustomErrors.badRequest("isVariableWeight es requerido");

    //? Convertir Decimal de Prisma a number
    const priceNumber = typeof price === 'object' && 'toNumber' in price 
      ? price.toNumber() 
      : Number(price);

    //? Convertir pricePerKg de Prisma a number (puede ser null)
    const pricePerKgNumber = pricePerKg
      ? (typeof pricePerKg === 'object' && 'toNumber' in pricePerKg 
          ? pricePerKg.toNumber() 
          : Number(pricePerKg))
      : null;

    //? createdAt por defecto es la fecha actual en caso de que no se proporcione
    let createdAtDate: Date | undefined = undefined;
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

    //? Mapear categoría si existe
    const categoryEntity = category ? CategoryEntity.mapFromPrisma(category) : undefined;

    //? Mapear batches si existen
    const batchesEntities = batches && Array.isArray(batches)
      ? batches.map((batch: any) => ProductBatchEntity.mapFromPrisma(batch))
      : undefined;

    return new ProductEntity(
      id,
      name,
      description ?? null,
      priceNumber,
      sku ?? null,
      stock,
      minStock,
      image ?? null,
      status,
      ingredients ?? null,
      categoryId,
      isVariableWeight ?? false,
      pricePerKgNumber,
      categoryEntity,
      batchesEntities,
      createdAtDate,
      updatedAtDate
    );
  }
}


