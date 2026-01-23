import {
  GetSellersReportSchema,
  getSellersReportSchema,
} from "../../schemas/report/get-sellers-report-validator.schema";

export class GetSellersReportDto {
  constructor(
    public readonly startDate: GetSellersReportSchema["startDate"],
    public readonly endDate: GetSellersReportSchema["endDate"],
    public readonly limit: GetSellersReportSchema["limit"],
  ) {}

  public static create(dto: {
    [key: string]: any;
  }): [string?, GetSellersReportDto?] {
    const result = getSellersReportSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { startDate, endDate, limit } = result.data;

    return [undefined, new GetSellersReportDto(startDate, endDate, limit)];
  }
}
