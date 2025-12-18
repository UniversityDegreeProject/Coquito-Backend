import {
  GetSaleByIdSchema,
  getSaleByIdSchema,
} from "../../schemas/sale/get-sale-by-id-validator.schema";

export class GetSaleByIdDto {
  constructor(public readonly saleId: GetSaleByIdSchema["saleId"]) {}

  public static create(dto: {
    [key: string]: any;
  }): [string?, GetSaleByIdDto?] {
    const result = getSaleByIdSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { saleId } = result.data;
    return [undefined, new GetSaleByIdDto(saleId)];
  }
}
