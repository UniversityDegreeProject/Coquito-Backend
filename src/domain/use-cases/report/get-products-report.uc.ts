import { ProductsReportEntity } from "../../entities/report.entity";
import { GetProductsReportDto } from "../../dto/report/get-products-report.dto";
import { ReportRepository } from "../../repositories/report.repository";

/**
 * Caso de uso para obtener reporte de productos
 */
interface GetProductsReportUseCase {
  execute(dto: GetProductsReportDto): Promise<ProductsReportEntity>;
}

export class GetProductsReportUseCaseImpl implements GetProductsReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(dto: GetProductsReportDto): Promise<ProductsReportEntity> {
    return this.reportRepository.getProductsReport(dto);
  }
}

