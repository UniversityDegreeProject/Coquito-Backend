import {
  DailyReportEntity,
  SalesReportEntity,
  ProductsReportEntity,
  CustomersReportEntity,
  CashRegisterSummaryReportEntity,
} from "../entities/report.entity";
import {
  GetDailyReportDto,
  GetSalesReportDto,
  GetProductsReportDto,
  GetCustomersReportDto,
  GetCashRegisterSummaryDto,
} from "../dto/report";

/**
 * Datasource abstracto para Reportes
 * Define las operaciones que debe implementar cualquier datasource de reportes
 */
export abstract class ReportDatasource {
  /**
   * Obtiene el reporte diario para una fecha específica
   * Incluye información del cierre de caja y resumen de ventas del día
   */
  abstract getDailyReport(dto: GetDailyReportDto): Promise<DailyReportEntity>;

  /**
   * Obtiene el reporte de ventas en un rango de fechas
   * Incluye totales, ventas por método de pago, ventas por día y por hora
   */
  abstract getSalesReport(dto: GetSalesReportDto): Promise<SalesReportEntity>;

  /**
   * Obtiene el reporte de productos más vendidos en un rango de fechas
   */
  abstract getProductsReport(dto: GetProductsReportDto): Promise<ProductsReportEntity>;

  /**
   * Obtiene el reporte de mejores clientes en un rango de fechas
   */
  abstract getCustomersReport(dto: GetCustomersReportDto): Promise<CustomersReportEntity>;

  /**
   * Obtiene el resumen de cierres de caja en un rango de fechas
   */
  abstract getCashRegisterSummary(dto: GetCashRegisterSummaryDto): Promise<CashRegisterSummaryReportEntity>;
}

