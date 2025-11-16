import { GetProductsReportSchema, getProductsReportSchema } from "../../schemas/report/get-products-report-validator.schema";

export class GetProductsReportDto {
  constructor(
    public readonly startDate: GetProductsReportSchema["startDate"],
    public readonly endDate: GetProductsReportSchema["endDate"],
    public readonly limit: GetProductsReportSchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetProductsReportDto?] {
    const result = getProductsReportSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { startDate, endDate, limit } = result.data;

    return [undefined, new GetProductsReportDto(startDate, endDate, limit)];
  }
}

