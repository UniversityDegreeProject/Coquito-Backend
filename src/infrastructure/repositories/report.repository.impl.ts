import {
  ReportRepository,
  ReportDatasource,
  DailyReportEntity,
  SalesReportEntity,
  ProductsReportEntity,
  CustomersReportEntity,
  CashRegisterSummaryReportEntity,
  SellersReportEntity,
  GetDailyReportDto,
  GetSalesReportDto,
  GetProductsReportDto,
  GetCustomersReportDto,
  GetCashRegisterSummaryDto,
  GetSellersReportDto,
} from "../../domain";

export class ReportRepositoryImpl implements ReportRepository {
  constructor(private readonly reportDatasource: ReportDatasource) {}

  getDailyReport(dto: GetDailyReportDto): Promise<DailyReportEntity> {
    return this.reportDatasource.getDailyReport(dto);
  }

  getSalesReport(dto: GetSalesReportDto): Promise<SalesReportEntity> {
    return this.reportDatasource.getSalesReport(dto);
  }

  getProductsReport(dto: GetProductsReportDto): Promise<ProductsReportEntity> {
    return this.reportDatasource.getProductsReport(dto);
  }

  getCustomersReport(
    dto: GetCustomersReportDto,
  ): Promise<CustomersReportEntity> {
    return this.reportDatasource.getCustomersReport(dto);
  }

  getCashRegisterSummary(
    dto: GetCashRegisterSummaryDto,
  ): Promise<CashRegisterSummaryReportEntity> {
    return this.reportDatasource.getCashRegisterSummary(dto);
  }

  getSellersReport(dto: GetSellersReportDto): Promise<SellersReportEntity> {
    return this.reportDatasource.getSellersReport(dto);
  }
}
