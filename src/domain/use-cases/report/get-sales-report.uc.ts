import { SalesReportEntity } from "../../entities/report.entity";
import { GetSalesReportDto } from "../../dto/report/get-sales-report.dto";
import { ReportRepository } from "../../repositories/report.repository";

/**
 * Caso de uso para obtener reporte de ventas
 */
interface GetSalesReportUseCase {
  execute(dto: GetSalesReportDto): Promise<SalesReportEntity>;
}

export class GetSalesReportUseCaseImpl implements GetSalesReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(dto: GetSalesReportDto): Promise<SalesReportEntity> {
    return this.reportRepository.getSalesReport(dto);
  }
}

