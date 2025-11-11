import { CloseCashRegisterSchema, closeCashRegisterSchema } from "../../schemas/cash-register/close-cash-register-validator.schema";

export class CloseCashRegisterDto {
  constructor(
    public readonly cashRegisterId: CloseCashRegisterSchema["cashRegisterId"],
    public readonly closingAmount: CloseCashRegisterSchema["closingAmount"],
    public readonly notes: CloseCashRegisterSchema["notes"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CloseCashRegisterDto?] {
    const result = closeCashRegisterSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { cashRegisterId, closingAmount, notes } = result.data;
    return [undefined, new CloseCashRegisterDto(cashRegisterId, closingAmount, notes)];
  }
}

