import { GetOrderByIdSchema, getOrderByIdSchema } from "../../schemas/order/get-order-by-id-validator.schema";

export class GetOrderByIdDto {
  constructor(public readonly orderId: GetOrderByIdSchema["orderId"]) {}

  public static create(dto: { [key: string]: any }): [string?, GetOrderByIdDto?] {
    const result = getOrderByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { orderId } = result.data;
    return [undefined, new GetOrderByIdDto(orderId)];
  }
}

