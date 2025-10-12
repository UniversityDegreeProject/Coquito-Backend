import { SearchUsersSchema, searchUsersSchema } from "../../schemas/user/search-users-validator.schema";

export class SearchUsersDto {
  constructor(
    public readonly search?: SearchUsersSchema["search"],
    public readonly role?: SearchUsersSchema["role"],
    public readonly status?: SearchUsersSchema["status"],
    public readonly page: SearchUsersSchema["page"] = 1,
    public readonly limit: SearchUsersSchema["limit"] = 10
  ) {}

  public static create(dto: {[key: string]: any}): [string?, SearchUsersDto?] {
    const result = searchUsersSchema.safeParse(dto);
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }

    const { search, role, status, page, limit } = result.data;
    
    return [
      undefined,
      new SearchUsersDto(search, role, status, page, limit)
    ];
  }
}

