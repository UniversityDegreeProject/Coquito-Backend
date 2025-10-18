import { SearchCustomersSchema, searchCustomersSchema } from "../../schemas/customer/search-customers-validator.schema";

export class SearchCustomersDto {
  constructor(
    public readonly search: SearchCustomersSchema["search"],
    public readonly type: SearchCustomersSchema["type"],
    public readonly page: SearchCustomersSchema["page"],
    public readonly limit: SearchCustomersSchema["limit"]
  ) {}

  public static create(dto: { [key: string]: any }): [string?, SearchCustomersDto?] {
    const result = searchCustomersSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { search, type, page, limit } = result.data;
    return [undefined, new SearchCustomersDto(search, type, page, limit)];
  }
}

