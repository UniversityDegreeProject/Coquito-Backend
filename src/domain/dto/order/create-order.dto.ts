import { CreateOrderSchema, createOrderSchema, OrderItemSchema } from "../../schemas/order/create-order-validator.schema";

export class CreateOrderDto {
  constructor(
    public readonly customerId: CreateOrderSchema["customerId"],
    public readonly userId: CreateOrderSchema["userId"],
    public readonly cashRegisterId: CreateOrderSchema["cashRegisterId"],
    public readonly items: OrderItemSchema[],
    public readonly paymentMethod: CreateOrderSchema["paymentMethod"],
    public readonly amountPaid: CreateOrderSchema["amountPaid"],
    public readonly notes: CreateOrderSchema["notes"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CreateOrderDto?] {
    const result = createOrderSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { customerId, userId, cashRegisterId, items, paymentMethod, amountPaid, notes } = result.data;
    return [
      undefined,
      new CreateOrderDto(customerId, userId, cashRegisterId, items, paymentMethod, amountPaid, notes),
    ];
  }
}

