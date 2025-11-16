import { GetSalesReportSchema, getSalesReportSchema } from "../../schemas/report/get-sales-report-validator.schema";

export class GetSalesReportDto {
  constructor(
    public readonly startDate: GetSalesReportSchema["startDate"],
    public readonly endDate: GetSalesReportSchema["endDate"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetSalesReportDto?] {
    const result = getSalesReportSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { startDate, endDate } = result.data;

    return [undefined, new GetSalesReportDto(startDate, endDate)];
  }
}

