import { SaleEntity } from "../../entities/sale.entity";
import { CreateSaleDto } from "../../dto/sale/create-sale.dto";
import { SaleRepository } from "../../repositories/sale.repository";

/**
 * Caso de uso para crear una nueva venta
 * Valida stock, reduce inventario, crea movimientos de stock y actualiza caja
 */
interface CreateSaleUseCase {
  execute(dto: CreateSaleDto): Promise<SaleEntity>;
}

export class CreateSaleUseCaseImpl implements CreateSaleUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  execute(dto: CreateSaleDto): Promise<SaleEntity> {
    return this.saleRepository.createSale(dto);
  }
}
