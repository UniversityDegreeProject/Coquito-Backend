import { SaleEntity } from "../../entities/sale.entity";
import { GetSaleByIdDto } from "../../dto/sale/get-sale-by-id.dto";
import { SaleRepository } from "../../repositories/sale.repository";

/**
 * Caso de uso para obtener una venta por su ID
 */
interface GetSaleByIdUseCase {
  execute(dto: GetSaleByIdDto): Promise<SaleEntity>;
}

export class GetSaleByIdUseCaseImpl implements GetSaleByIdUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  execute(dto: GetSaleByIdDto): Promise<SaleEntity> {
    return this.saleRepository.getSaleById(dto);
  }
}
