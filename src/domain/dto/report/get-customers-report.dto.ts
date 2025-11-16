import { GetCustomersReportSchema, getCustomersReportSchema } from "../../schemas/report/get-customers-report-validator.schema";

export class GetCustomersReportDto {
  constructor(
    public readonly startDate: GetCustomersReportSchema["startDate"],
    public readonly endDate: GetCustomersReportSchema["endDate"],
    public readonly limit: GetCustomersReportSchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetCustomersReportDto?] {
    const result = getCustomersReportSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { startDate, endDate, limit } = result.data;

    return [undefined, new GetCustomersReportDto(startDate, endDate, limit)];
  }
}

