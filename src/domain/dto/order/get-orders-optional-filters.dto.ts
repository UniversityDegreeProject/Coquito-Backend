import { GetOrdersOptionalFiltersSchema, getOrdersOptionalFiltersSchema } from "../../schemas/order/get-orders-optional-filters-validator.schema";

export class GetOrdersOptionalFiltersDto {
  constructor(
    public readonly userId: GetOrdersOptionalFiltersSchema["userId"],
    public readonly customerId: GetOrdersOptionalFiltersSchema["customerId"],
    public readonly cashRegisterId: GetOrdersOptionalFiltersSchema["cashRegisterId"],
    public readonly status: GetOrdersOptionalFiltersSchema["status"],
    public readonly paymentMethod: GetOrdersOptionalFiltersSchema["paymentMethod"],
    public readonly startDate: GetOrdersOptionalFiltersSchema["startDate"],
    public readonly endDate: GetOrdersOptionalFiltersSchema["endDate"],
    public readonly page: GetOrdersOptionalFiltersSchema["page"],
    public readonly limit: GetOrdersOptionalFiltersSchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetOrdersOptionalFiltersDto?] {
    const result = getOrdersOptionalFiltersSchema.safeParse(dto);
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
      new GetOrdersOptionalFiltersDto(
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

