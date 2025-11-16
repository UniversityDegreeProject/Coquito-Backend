import { GetCashRegisterSummarySchema, getCashRegisterSummarySchema } from "../../schemas/report/get-cash-register-summary-validator.schema";

export class GetCashRegisterSummaryDto {
  constructor(
    public readonly startDate: GetCashRegisterSummarySchema["startDate"],
    public readonly endDate: GetCashRegisterSummarySchema["endDate"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetCashRegisterSummaryDto?] {
    const result = getCashRegisterSummarySchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { startDate, endDate } = result.data;

    return [undefined, new GetCashRegisterSummaryDto(startDate, endDate)];
  }
}

