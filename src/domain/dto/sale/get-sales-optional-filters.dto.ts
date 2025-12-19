import {
  GetSalesOptionalFiltersSchema,
  getSalesOptionalFiltersSchema,
} from "../../schemas/sale/get-sales-optional-filters-validator.schema";

export class GetSalesOptionalFiltersDto {
  constructor(
    public readonly userId: GetSalesOptionalFiltersSchema["userId"],
    public readonly customerId: GetSalesOptionalFiltersSchema["customerId"],
    public readonly cashRegisterId: GetSalesOptionalFiltersSchema["cashRegisterId"],
    public readonly status: GetSalesOptionalFiltersSchema["status"],
    public readonly paymentMethod: GetSalesOptionalFiltersSchema["paymentMethod"],
    public readonly startDate: GetSalesOptionalFiltersSchema["startDate"],
    public readonly endDate: GetSalesOptionalFiltersSchema["endDate"],
    public readonly page: GetSalesOptionalFiltersSchema["page"],
    public readonly limit: GetSalesOptionalFiltersSchema["limit"]
  ) {}

  public static create(dto: {
    [key: string]: any;
  }): [string?, GetSalesOptionalFiltersDto?] {
    const result = getSalesOptionalFiltersSchema.safeParse(dto);
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
      new GetSalesOptionalFiltersDto(
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
