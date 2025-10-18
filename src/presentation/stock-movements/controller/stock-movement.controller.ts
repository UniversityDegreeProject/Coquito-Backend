import { Request, Response } from "express";
import {
  HttpCustomErrors,
  StockMovementRepository,
  CreateStockMovementDto,
  GetStockMovementByIdDto,
  SearchStockMovementsDto,
  GetStockMovementsByProductDto,
  CreateStockMovementUseCaseImpl,
  GetStockMovementByIdUseCaseImpl,
  SearchStockMovementsUseCaseImpl,
  GetStockMovementsByProductUseCaseImpl,
} from "../../../domain";

export class StockMovementController {
  constructor(private readonly stockMovementRepository: StockMovementRepository) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  // * Crear movimiento de stock
  createStockMovement = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createStockMovementDto] = CreateStockMovementDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!createStockMovementDto)
      return res.status(400).json({ error: "Datos incorrectos" });

    new CreateStockMovementUseCaseImpl(this.stockMovementRepository)
      .execute(createStockMovementDto)
      .then((movement) => {
        return res.status(201).json({
          message: "Movimiento de stock registrado exitosamente",
          movement,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  // * Obtener movimiento por ID
  getStockMovementById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, getStockMovementByIdDto] = GetStockMovementByIdDto.create({ id });
    if (error) return res.status(400).json({ error: error });
    if (!getStockMovementByIdDto)
      return res.status(400).json({ error: "Movimiento no encontrado" });

    new GetStockMovementByIdUseCaseImpl(this.stockMovementRepository)
      .execute(getStockMovementByIdDto)
      .then((movement) => {
        if (!movement)
          return res.status(404).json({ error: "Movimiento de stock no encontrado" });
        return res.status(200).json({ movement });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  // * Buscar movimientos con filtros
  searchStockMovements = async (req: Request, res: Response) => {
    const query = req.query;

    //? Convertir page y limit a números
    const parsedQuery = {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    };

    const [error, searchStockMovementsDto] = SearchStockMovementsDto.create(parsedQuery);
    if (error) return res.status(400).json({ error: error });
    if (!searchStockMovementsDto)
      return res.status(400).json({ error: "Parámetros de búsqueda incorrectos" });

    new SearchStockMovementsUseCaseImpl(this.stockMovementRepository)
      .execute(searchStockMovementsDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  // * Obtener movimientos por producto
  getStockMovementsByProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const query = req.query;

    //? Convertir page y limit a números
    const parsedQuery = {
      productId,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    };

    const [error, getStockMovementsByProductDto] =
      GetStockMovementsByProductDto.create(parsedQuery);
    if (error) return res.status(400).json({ error: error });
    if (!getStockMovementsByProductDto)
      return res.status(400).json({ error: "ID de producto inválido" });

    new GetStockMovementsByProductUseCaseImpl(this.stockMovementRepository)
      .execute(getStockMovementsByProductDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}

