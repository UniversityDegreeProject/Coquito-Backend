import { CashRegisterSummaryReportEntity } from "../../entities/report.entity";
import { GetCashRegisterSummaryDto } from "../../dto/report/get-cash-register-summary.dto";
import { ReportRepository } from "../../repositories/report.repository";

/**
 * Caso de uso para obtener resumen de cierres de caja
 */
interface GetCashRegisterSummaryUseCase {
  execute(dto: GetCashRegisterSummaryDto): Promise<CashRegisterSummaryReportEntity>;
}

export class GetCashRegisterSummaryUseCaseImpl implements GetCashRegisterSummaryUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(dto: GetCashRegisterSummaryDto): Promise<CashRegisterSummaryReportEntity> {
    return this.reportRepository.getCashRegisterSummary(dto);
  }
}

