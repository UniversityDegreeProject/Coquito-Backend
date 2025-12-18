import { SaleEntity } from "../entities/sale.entity";
import { CreateSaleDto } from "../dto/sale/create-sale.dto";
import { GetSaleByIdDto } from "../dto/sale/get-sale-by-id.dto";
import { GetSalesOptionalFiltersDto } from "../dto/sale/get-sales-optional-filters.dto";
import { PaginateResponse } from "../interfaces/shared/paginated-response.interface";

/**
 * Repository abstracto para Sales
 * Define las operaciones que debe implementar cualquier repository de ventas
 */
export abstract class SaleRepository {
  abstract createSale(dto: CreateSaleDto): Promise<SaleEntity>;
  abstract getSaleById(dto: GetSaleByIdDto): Promise<SaleEntity>;
  abstract getSales(
    dto: GetSalesOptionalFiltersDto
  ): Promise<PaginateResponse<SaleEntity>>;
}
