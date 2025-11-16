import { UpdateProductSchema, updateProductSchema } from "../../schemas/product/update-product-validator.schema";

export class UpdateProductDto {
  constructor(
    public readonly id: UpdateProductSchema["id"],
    public readonly name: UpdateProductSchema["name"],
    public readonly description: UpdateProductSchema["description"],
    public readonly price: UpdateProductSchema["price"],
    public readonly sku: UpdateProductSchema["sku"],
    public readonly stock: UpdateProductSchema["stock"],
    public readonly minStock: UpdateProductSchema["minStock"],
    public readonly image: UpdateProductSchema["image"],
    public readonly categoryId: UpdateProductSchema["categoryId"],
    public readonly status: UpdateProductSchema["status"],
    public readonly isVariableWeight: UpdateProductSchema["isVariableWeight"],
    public readonly pricePerKg: UpdateProductSchema["pricePerKg"],
    public readonly expirationDate: UpdateProductSchema["expirationDate"],
    public readonly updatedAt: UpdateProductSchema["updatedAt"]
  ) {}

  /**
   * Retorna solo los campos que tienen valor (excluyendo el ID)
   * Útil para hacer updates parciales en Prisma
   */
  get values() {
    const returnObj: { [key: string]: any } = {};
    if (this.name !== undefined) returnObj.name = this.name;
    if (this.description !== undefined) returnObj.description = this.description;
    if (this.price !== undefined) returnObj.price = this.price;
    if (this.sku !== undefined) returnObj.sku = this.sku;
    if (this.stock !== undefined) returnObj.stock = this.stock;
    if (this.minStock !== undefined) returnObj.minStock = this.minStock;
    if (this.image !== undefined) returnObj.image = this.image;
    if (this.categoryId !== undefined) returnObj.categoryId = this.categoryId;
    if (this.status !== undefined) returnObj.status = this.status;
    if (this.isVariableWeight !== undefined) returnObj.isVariableWeight = this.isVariableWeight;
    if (this.pricePerKg !== undefined) returnObj.pricePerKg = this.pricePerKg;
    // expirationDate: si es undefined no se incluye, si es null se incluye para limpiar el campo
    if (this.expirationDate !== undefined) {
      returnObj.expirationDate = this.expirationDate ? new Date(this.expirationDate) : null;
    }
    if (this.updatedAt !== undefined) returnObj.updatedAt = this.updatedAt;
    return returnObj;
  }

  public static create(dto: { [key: string]: any }): [string?, UpdateProductDto?] {
    const result = updateProductSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { id, name, description, price, sku, stock, minStock, image, categoryId, status, isVariableWeight, pricePerKg, expirationDate, updatedAt } = result.data;
    return [undefined, new UpdateProductDto(id, name, description, price, sku, stock, minStock, image, categoryId, status, isVariableWeight, pricePerKg, expirationDate, updatedAt)];
  }
}

