import { CustomerOptionalFiltersSchema, customerOptionalFiltersSchema } from "../../schemas/customer/customer-optional-filters-validator.schema";
export class CustomersOptionalFiltersDto {
  constructor(
    public readonly search: CustomerOptionalFiltersSchema["search"],
    public readonly type: CustomerOptionalFiltersSchema["type"],
    public readonly page: CustomerOptionalFiltersSchema["page"],
    public readonly limit: CustomerOptionalFiltersSchema["limit"],
  ) {}

  public static create(dto: { [key: string]: any }): [string?, CustomersOptionalFiltersDto?] {
    const result = customerOptionalFiltersSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { search, type, page, limit } = result.data;
    return [undefined, new CustomersOptionalFiltersDto(search, type, page, limit)];
  }
}

