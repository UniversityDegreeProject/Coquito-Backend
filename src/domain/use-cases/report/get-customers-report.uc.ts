import { CustomersReportEntity } from "../../entities/report.entity";
import { GetCustomersReportDto } from "../../dto/report/get-customers-report.dto";
import { ReportRepository } from "../../repositories/report.repository";

/**
 * Caso de uso para obtener reporte de clientes
 */
interface GetCustomersReportUseCase {
  execute(dto: GetCustomersReportDto): Promise<CustomersReportEntity>;
}

export class GetCustomersReportUseCaseImpl implements GetCustomersReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(dto: GetCustomersReportDto): Promise<CustomersReportEntity> {
    return this.reportRepository.getCustomersReport(dto);
  }
}

