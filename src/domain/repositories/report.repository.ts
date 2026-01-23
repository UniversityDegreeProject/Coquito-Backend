import {
  DailyReportEntity,
  SalesReportEntity,
  ProductsReportEntity,
  CustomersReportEntity,
  CashRegisterSummaryReportEntity,
  SellersReportEntity,
} from "../entities/report.entity";
import {
  GetDailyReportDto,
  GetSalesReportDto,
  GetProductsReportDto,
  GetCustomersReportDto,
  GetCashRegisterSummaryDto,
  GetSellersReportDto,
} from "../dto/report";

/**
 * Repository abstracto para Reportes
 * Define las operaciones que debe implementar cualquier repository de reportes
 */
export abstract class ReportRepository {
  abstract getDailyReport(dto: GetDailyReportDto): Promise<DailyReportEntity>;
  abstract getSalesReport(dto: GetSalesReportDto): Promise<SalesReportEntity>;
  abstract getProductsReport(
    dto: GetProductsReportDto,
  ): Promise<ProductsReportEntity>;
  abstract getCustomersReport(
    dto: GetCustomersReportDto,
  ): Promise<CustomersReportEntity>;
  abstract getCashRegisterSummary(
    dto: GetCashRegisterSummaryDto,
  ): Promise<CashRegisterSummaryReportEntity>;
  abstract getSellersReport(
    dto: GetSellersReportDto,
  ): Promise<SellersReportEntity>;
}
