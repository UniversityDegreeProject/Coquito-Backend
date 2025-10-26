import { GetUserOptionalFiltersSchema, getUserOptionalFiltersSchema } from "../../schemas";

export class GetUserOptionalFiltersDto {
  private constructor(
    public readonly search: GetUserOptionalFiltersSchema["search"],
    public readonly role: GetUserOptionalFiltersSchema["role"],
    public readonly status: GetUserOptionalFiltersSchema["status"],
    public readonly page: GetUserOptionalFiltersSchema["page"],
    public readonly limit: GetUserOptionalFiltersSchema["limit"],
  ) {}

  static create(dto: { [key: string]: any }): [string?, GetUserOptionalFiltersDto?] {
    const result = getUserOptionalFiltersSchema.safeParse(dto);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }
    const { search, role, status, page, limit } = result.data;
    return [undefined, new GetUserOptionalFiltersDto(search, role, status, page, limit)];
  }
}