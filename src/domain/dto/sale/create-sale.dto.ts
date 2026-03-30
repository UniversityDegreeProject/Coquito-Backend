import {
  CreateSaleSchema,
  createSaleSchema,
  SaleItemSchema,
} from "../../schemas/sale/create-sale-validator.schema";

export class CreateSaleDto {
  constructor(
    public readonly customerId: CreateSaleSchema["customerId"],
    public readonly userId: CreateSaleSchema["userId"],
    public readonly cashRegisterId: CreateSaleSchema["cashRegisterId"],
    public readonly items: SaleItemSchema[],
    public readonly paymentMethod: CreateSaleSchema["paymentMethod"],
    public readonly amountPaid: CreateSaleSchema["amountPaid"],
    public readonly notes: CreateSaleSchema["notes"],
    public readonly codigoRecaudacion?: CreateSaleSchema["codigoRecaudacion"],
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CreateSaleDto?] {
    const result = createSaleSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const {
      customerId,
      userId,
      cashRegisterId,
      items,
      paymentMethod,
      amountPaid,
      notes,
      codigoRecaudacion,
    } = result.data;
    return [
      undefined,
      new CreateSaleDto(
        customerId,
        userId,
        cashRegisterId,
        items,
        paymentMethod,
        amountPaid,
        notes,
        codigoRecaudacion,
      ),
    ];
  }
}
