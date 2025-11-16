import { DailyReportEntity } from "../../entities/report.entity";
import { GetDailyReportDto } from "../../dto/report/get-daily-report.dto";
import { ReportRepository } from "../../repositories/report.repository";

/**
 * Caso de uso para obtener reporte diario
 */
interface GetDailyReportUseCase {
  execute(dto: GetDailyReportDto): Promise<DailyReportEntity>;
}

export class GetDailyReportUseCaseImpl implements GetDailyReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(dto: GetDailyReportDto): Promise<DailyReportEntity> {
    return this.reportRepository.getDailyReport(dto);
  }
}

