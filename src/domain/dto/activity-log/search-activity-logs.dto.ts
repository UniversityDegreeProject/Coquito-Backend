export class SearchActivityLogsDto {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly userId?: string,
    public readonly action?: string,
    public readonly entity?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly search?: string
  ) {}

  static fromObject(object: { [key: string]: unknown }): SearchActivityLogsDto {
    const { page, limit, userId, action, entity, startDate, endDate, search } =
      object;

    return new SearchActivityLogsDto(
      page ? +page : 1,
      limit ? +limit : 10,
      userId as string | undefined,
      action as string | undefined,
      entity as string | undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      search as string | undefined
    );
  }
}
