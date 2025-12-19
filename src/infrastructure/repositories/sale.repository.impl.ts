import {
  SaleEntity,
  SaleDatasource,
  SaleRepository,
  CreateSaleDto,
  GetSaleByIdDto,
  GetSalesOptionalFiltersDto,
  PaginateResponse,
} from "../../domain";

export class SaleRepositoryImpl implements SaleRepository {
  constructor(private readonly saleDatasource: SaleDatasource) {}

  createSale(dto: CreateSaleDto): Promise<SaleEntity> {
    return this.saleDatasource.createSale(dto);
  }

  getSaleById(dto: GetSaleByIdDto): Promise<SaleEntity> {
    return this.saleDatasource.getSaleById(dto);
  }

  getSales(
    dto: GetSalesOptionalFiltersDto
  ): Promise<PaginateResponse<SaleEntity>> {
    return this.saleDatasource.getSales(dto);
  }
}
