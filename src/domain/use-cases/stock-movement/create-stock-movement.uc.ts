import { StockMovementEntity } from "../../entities/stock-movement.entity";
import { CreateStockMovementDto } from "../../dto/stock-movement/create-stock-movement.dto";
import { StockMovementRepository } from "../../repositories/stock-movement.repository";

interface CreateStockMovementUseCase {
  execute(stockMovement: CreateStockMovementDto): Promise<StockMovementEntity>;
}

export class CreateStockMovementUseCaseImpl implements CreateStockMovementUseCase {
  constructor(private readonly stockMovementRepository: StockMovementRepository) {}

  execute(stockMovement: CreateStockMovementDto): Promise<StockMovementEntity> {
    return this.stockMovementRepository.createStockMovement(stockMovement);
  }
}

