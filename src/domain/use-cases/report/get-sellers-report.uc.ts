import { SellersReportEntity } from "../../entities/report.entity";
import { GetSellersReportDto } from "../../dto/report/get-sellers-report.dto";
import { ReportRepository } from "../../repositories/report.repository";

/**
 * Caso de uso para obtener reporte de vendedores
 */
interface GetSellersReportUseCase {
  execute(dto: GetSellersReportDto): Promise<SellersReportEntity>;
}

export class GetSellersReportUseCaseImpl implements GetSellersReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(dto: GetSellersReportDto): Promise<SellersReportEntity> {
    return this.reportRepository.getSellersReport(dto);
  }
}
