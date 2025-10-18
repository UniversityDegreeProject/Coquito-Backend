import { StockMovementEntity } from "../../entities/stock-movement.entity";
import { GetStockMovementByIdDto } from "../../dto/stock-movement/get-stock-movement-by-id.dto";
import { StockMovementRepository } from "../../repositories/stock-movement.repository";

interface GetStockMovementByIdUseCase {
  execute(id: GetStockMovementByIdDto): Promise<StockMovementEntity>;
}

export class GetStockMovementByIdUseCaseImpl implements GetStockMovementByIdUseCase {
  constructor(private readonly stockMovementRepository: StockMovementRepository) {}

  execute(id: GetStockMovementByIdDto): Promise<StockMovementEntity> {
    return this.stockMovementRepository.getStockMovementById(id);
  }
}

