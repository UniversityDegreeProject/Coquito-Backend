import { SaleEntity } from "../../entities/sale.entity";
import { GetSalesOptionalFiltersDto } from "../../dto/sale/get-sales-optional-filters.dto";
import { SaleRepository } from "../../repositories/sale.repository";
import { PaginateResponse } from "../../interfaces/shared/paginated-response.interface";

/**
 * Caso de uso para obtener ventas con filtros opcionales y paginación
 */
interface GetSalesOptionalFiltersUseCase {
  execute(
    dto: GetSalesOptionalFiltersDto
  ): Promise<PaginateResponse<SaleEntity>>;
}

export class GetSalesOptionalFiltersUseCaseImpl
  implements GetSalesOptionalFiltersUseCase
{
  constructor(private readonly saleRepository: SaleRepository) {}

  execute(
    dto: GetSalesOptionalFiltersDto
  ): Promise<PaginateResponse<SaleEntity>> {
    return this.saleRepository.getSales(dto);
  }
}
