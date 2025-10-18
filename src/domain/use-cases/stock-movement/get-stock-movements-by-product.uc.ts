import { StockMovementEntity } from "../../entities/stock-movement.entity";
import { GetStockMovementsByProductDto } from "../../dto/stock-movement/get-stock-movements-by-product.dto";
import { StockMovementRepository } from "../../repositories/stock-movement.repository";

interface GetStockMovementsByProductUseCase {
  execute(dto: GetStockMovementsByProductDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export class GetStockMovementsByProductUseCaseImpl implements GetStockMovementsByProductUseCase {
  constructor(private readonly stockMovementRepository: StockMovementRepository) {}

  execute(dto: GetStockMovementsByProductDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.stockMovementRepository.getStockMovementsByProduct(dto);
  }
}

