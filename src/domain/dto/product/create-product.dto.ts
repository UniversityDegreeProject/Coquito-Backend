import { CreateProductSchema, createProductSchema } from "../../schemas/product/create-product-validator.schema";

export class CreateProductDto {
  constructor(
    public readonly name: CreateProductSchema["name"],
    public readonly description: CreateProductSchema["description"],
    public readonly price: CreateProductSchema["price"],
    public readonly sku: CreateProductSchema["sku"],
    public readonly stock: CreateProductSchema["stock"],
    public readonly minStock: CreateProductSchema["minStock"],
    public readonly image: CreateProductSchema["image"],
    public readonly ingredients: CreateProductSchema["ingredients"],
    public readonly categoryId: CreateProductSchema["categoryId"],
    public readonly status: CreateProductSchema["status"],
    public readonly isVariableWeight: CreateProductSchema["isVariableWeight"],
    public readonly pricePerKg: CreateProductSchema["pricePerKg"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CreateProductDto?] {
    const result = createProductSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { name, description, price, sku, stock, minStock, image, ingredients, categoryId, status, isVariableWeight, pricePerKg } = result.data;
    return [undefined, new CreateProductDto(name, description, price, sku, stock, minStock, image, ingredients, categoryId, status, isVariableWeight, pricePerKg)];
  }
}

