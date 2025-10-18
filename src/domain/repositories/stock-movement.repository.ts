import { StockMovementEntity } from "../entities/stock-movement.entity";
import { CreateStockMovementDto } from "../dto/stock-movement/create-stock-movement.dto";
import { GetStockMovementByIdDto } from "../dto/stock-movement/get-stock-movement-by-id.dto";
import { SearchStockMovementsDto } from "../dto/stock-movement/search-stock-movements.dto";
import { GetStockMovementsByProductDto } from "../dto/stock-movement/get-stock-movements-by-product.dto";

export abstract class StockMovementRepository {
  abstract createStockMovement(stockMovement: CreateStockMovementDto): Promise<StockMovementEntity>;
  
  abstract getStockMovementById(id: GetStockMovementByIdDto): Promise<StockMovementEntity>;
  
  abstract searchStockMovements(searchDto: SearchStockMovementsDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  
  abstract getStockMovementsByProduct(dto: GetStockMovementsByProductDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

