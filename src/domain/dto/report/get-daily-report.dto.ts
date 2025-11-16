import { GetDailyReportSchema, getDailyReportSchema } from "../../schemas/report/get-daily-report-validator.schema";

export class GetDailyReportDto {
  constructor(public readonly date: GetDailyReportSchema["date"]) {}

  public static create(dto: { [key: string]: any }): [string?, GetDailyReportDto?] {
    const result = getDailyReportSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { date } = result.data;

    return [undefined, new GetDailyReportDto(date)];
  }
}

