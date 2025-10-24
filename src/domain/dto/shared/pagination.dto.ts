import { paginationSchema, PaginationSchema } from "../../schemas/shared";


export class PaginationDto {
  private constructor(
    public readonly page: PaginationSchema["page"],
    public readonly limit: PaginationSchema["limit"]
  ){}

  static create (dto : { [key : string] : any}) : [ string?, PaginationDto?] {

    const validatePagination = paginationSchema.safeParse(dto);

    if( !validatePagination.success ){
      const firstError = validatePagination.error.issues[0];

      return [ firstError?.message, undefined ];
    }

    const { page, limit } = validatePagination.data;

    return [ undefined , new PaginationDto(page, limit) ];


  }

}