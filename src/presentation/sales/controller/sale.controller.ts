import { Request, Response } from "express";
import {
  HttpCustomErrors,
  SaleRepository,
  CreateSaleDto,
  GetSaleByIdDto,
  GetSalesOptionalFiltersDto,
  CreateSaleUseCaseImpl,
  GetSaleByIdUseCaseImpl,
  GetSalesOptionalFiltersUseCaseImpl,
  SaleEntity,
} from "../../../domain";

export class SaleController {
  constructor(private readonly saleRepository: SaleRepository) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Internal server error" });
  };

  /**
   * POST /api/sales
   * Crea una nueva venta
   */
  createSale = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createSaleDto] = CreateSaleDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!createSaleDto)
      return res.status(400).json({ error: "Datos incorrectos" });

    new CreateSaleUseCaseImpl(this.saleRepository)
      .execute(createSaleDto)
      .then((sale: SaleEntity) => {
        return res.status(201).json({
          message: "Venta registrada exitosamente",
          sale,
        });
      })
      .catch((error: unknown) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/sales/:saleId
   * Obtiene una venta por su ID
   */
  getSaleById = async (req: Request, res: Response) => {
    const { saleId } = req.params;

    const [error, getSaleByIdDto] = GetSaleByIdDto.create({ saleId });
    if (error) return res.status(400).json({ error: error });
    if (!getSaleByIdDto)
      return res.status(400).json({ error: "ID de venta inválido" });

    new GetSaleByIdUseCaseImpl(this.saleRepository)
      .execute(getSaleByIdDto)
      .then((sale: SaleEntity) => {
        return res.status(200).json({ sale });
      })
      .catch((error: unknown) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/sales
   * Obtiene ventas con filtros opcionales y paginación
   */
  getSales = async (req: Request, res: Response) => {
    const query = req.query;

    //? Parsear números
    const parsedQuery = {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    };

    const [error, getSalesOptionalFiltersDto] =
      GetSalesOptionalFiltersDto.create(parsedQuery);
    if (error) return res.status(400).json({ error: error });
    if (!getSalesOptionalFiltersDto)
      return res
        .status(400)
        .json({ error: "Parámetros de búsqueda incorrectos" });

    new GetSalesOptionalFiltersUseCaseImpl(this.saleRepository)
      .execute(getSalesOptionalFiltersDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error: unknown) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}
