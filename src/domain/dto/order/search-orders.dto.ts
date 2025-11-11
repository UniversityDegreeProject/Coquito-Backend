import { SearchOrdersSchema, searchOrdersSchema } from "../../schemas/order/search-orders-validator.schema";

export class SearchOrdersDto {
  constructor(
    public readonly userId: SearchOrdersSchema["userId"],
    public readonly customerId: SearchOrdersSchema["customerId"],
    public readonly cashRegisterId: SearchOrdersSchema["cashRegisterId"],
    public readonly status: SearchOrdersSchema["status"],
    public readonly paymentMethod: SearchOrdersSchema["paymentMethod"],
    public readonly startDate: SearchOrdersSchema["startDate"],
    public readonly endDate: SearchOrdersSchema["endDate"],
    public readonly page: SearchOrdersSchema["page"],
    public readonly limit: SearchOrdersSchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, SearchOrdersDto?] {
    const result = searchOrdersSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const {
      userId,
      customerId,
      cashRegisterId,
      status,
      paymentMethod,
      startDate,
      endDate,
      page,
      limit,
    } = result.data;

    return [
      undefined,
      new SearchOrdersDto(
        userId,
        customerId,
        cashRegisterId,
        status,
        paymentMethod,
        startDate,
        endDate,
        page,
        limit
      ),
    ];
  }
}

