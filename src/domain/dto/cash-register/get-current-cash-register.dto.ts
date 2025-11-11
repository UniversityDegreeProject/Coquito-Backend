import { GetCurrentCashRegisterSchema, getCurrentCashRegisterSchema } from "../../schemas/cash-register/get-current-cash-register-validator.schema";

export class GetCurrentCashRegisterDto {
  constructor(
    public readonly userId: GetCurrentCashRegisterSchema["userId"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, GetCurrentCashRegisterDto?] {
    const result = getCurrentCashRegisterSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { userId } = result.data;
    return [undefined, new GetCurrentCashRegisterDto(userId)];
  }
}

