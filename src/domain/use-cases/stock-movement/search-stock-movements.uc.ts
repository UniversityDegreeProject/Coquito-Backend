import { StockMovementEntity } from "../../entities/stock-movement.entity";
import { SearchStockMovementsDto } from "../../dto/stock-movement/search-stock-movements.dto";
import { StockMovementRepository } from "../../repositories/stock-movement.repository";

interface SearchStockMovementsUseCase {
  execute(searchDto: SearchStockMovementsDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export class SearchStockMovementsUseCaseImpl implements SearchStockMovementsUseCase {
  constructor(private readonly stockMovementRepository: StockMovementRepository) {}

  execute(searchDto: SearchStockMovementsDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.stockMovementRepository.searchStockMovements(searchDto);
  }
}

