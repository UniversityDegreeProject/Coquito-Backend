import { OpenCashRegisterSchema, openCashRegisterSchema } from "../../schemas/cash-register/open-cash-register-validator.schema";

export class OpenCashRegisterDto {
  constructor(
    public readonly userId: OpenCashRegisterSchema["userId"],
    public readonly openingAmount: OpenCashRegisterSchema["openingAmount"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, OpenCashRegisterDto?] {
    const result = openCashRegisterSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { userId, openingAmount } = result.data;
    return [undefined, new OpenCashRegisterDto(userId, openingAmount)];
  }
}

