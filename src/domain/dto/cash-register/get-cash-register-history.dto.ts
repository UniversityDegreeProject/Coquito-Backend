import { GetCashRegisterHistorySchema, getCashRegisterHistorySchema } from "../../schemas/cash-register/get-cash-register-history-validator.schema";

export class GetCashRegisterHistoryDto {
  constructor(
    public readonly userId: GetCashRegisterHistorySchema["userId"],
    public readonly startDate: GetCashRegisterHistorySchema["startDate"],
    public readonly endDate: GetCashRegisterHistorySchema["endDate"],
    public readonly page: GetCashRegisterHistorySchema["page"],
    public readonly limit: GetCashRegisterHistorySchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetCashRegisterHistoryDto?] {
    const result = getCashRegisterHistorySchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { userId, startDate, endDate, page, limit } = result.data;
    return [undefined, new GetCashRegisterHistoryDto(userId, startDate, endDate, page, limit)];
  }
}

