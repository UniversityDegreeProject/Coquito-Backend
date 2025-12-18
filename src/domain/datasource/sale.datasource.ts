import { SaleEntity } from "../entities/sale.entity";
import { CreateSaleDto } from "../dto/sale/create-sale.dto";
import { GetSaleByIdDto } from "../dto/sale/get-sale-by-id.dto";
import { GetSalesOptionalFiltersDto } from "../dto/sale/get-sales-optional-filters.dto";
import { PaginateResponse } from "../interfaces/shared/paginated-response.interface";

/**
 * Datasource abstracto para Sales
 * Define las operaciones que debe implementar cualquier datasource de ventas
 */
export abstract class SaleDatasource {
  /**
   * Crea una nueva venta
   * - Valida stock disponible (productos fijos y batches)
   * - Reduce stock automáticamente
   * - Crea StockMovement tipo "Venta" para cada producto
   * - Actualiza totales en CashRegister
   * - Calcula subtotal, tax, total y vuelto
   */
  abstract createSale(dto: CreateSaleDto): Promise<SaleEntity>;

  /**
   * Obtiene una venta por su ID
   * Incluye items, customer, user y cashRegister
   */
  abstract getSaleById(dto: GetSaleByIdDto): Promise<SaleEntity>;

  /**
   * Obtiene ventas con filtros opcionales y paginación
   */
  abstract getSales(
    dto: GetSalesOptionalFiltersDto
  ): Promise<PaginateResponse<SaleEntity>>;
}
