import {
  StockMovementEntity,
  StockMovementDatasource,
  StockMovementRepository,
  CreateStockMovementDto,
  GetStockMovementByIdDto,
  SearchStockMovementsDto,
  GetStockMovementsByProductDto,
} from "../../domain";

export class StockMovementRepositoryImpl implements StockMovementRepository {
  constructor(private readonly stockMovementDatasource: StockMovementDatasource) {}

  createStockMovement(stockMovement: CreateStockMovementDto): Promise<StockMovementEntity> {
    return this.stockMovementDatasource.createStockMovement(stockMovement);
  }

  getStockMovementById(id: GetStockMovementByIdDto): Promise<StockMovementEntity> {
    return this.stockMovementDatasource.getStockMovementById(id);
  }

  searchStockMovements(searchDto: SearchStockMovementsDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.stockMovementDatasource.searchStockMovements(searchDto);
  }

  getStockMovementsByProduct(dto: GetStockMovementsByProductDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.stockMovementDatasource.getStockMovementsByProduct(dto);
  }
}

