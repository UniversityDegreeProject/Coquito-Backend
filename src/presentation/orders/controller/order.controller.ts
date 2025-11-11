import { Request, Response } from "express";
import {
  HttpCustomErrors,
  OrderRepository,
  CreateOrderDto,
  GetOrderByIdDto,
  SearchOrdersDto,
  CreateOrderUseCaseImpl,
  GetOrderByIdUseCaseImpl,
  SearchOrdersUseCaseImpl,
} from "../../../domain";

export class OrderController {
  constructor(private readonly orderRepository: OrderRepository) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Internal server error" });
  };

  /**
   * POST /api/orders
   * Crea una nueva orden (venta)
   */
  createOrder = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createOrderDto] = CreateOrderDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!createOrderDto) return res.status(400).json({ error: "Datos incorrectos" });

    new CreateOrderUseCaseImpl(this.orderRepository)
      .execute(createOrderDto)
      .then((order) => {
        return res.status(201).json({
          message: "Venta registrada exitosamente",
          order,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/orders/:orderId
   * Obtiene una orden por su ID
   */
  getOrderById = async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const [error, getOrderByIdDto] = GetOrderByIdDto.create({ orderId });
    if (error) return res.status(400).json({ error: error });
    if (!getOrderByIdDto) return res.status(400).json({ error: "ID de orden inválido" });

    new GetOrderByIdUseCaseImpl(this.orderRepository)
      .execute(getOrderByIdDto)
      .then((order) => {
        return res.status(200).json({ order });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/orders
   * Busca órdenes con filtros opcionales y paginación
   */
  searchOrders = async (req: Request, res: Response) => {
    const query = req.query;

    //? Parsear números
    const parsedQuery = {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    };

    const [error, searchOrdersDto] = SearchOrdersDto.create(parsedQuery);
    if (error) return res.status(400).json({ error: error });
    if (!searchOrdersDto)
      return res.status(400).json({ error: "Parámetros de búsqueda incorrectos" });

    new SearchOrdersUseCaseImpl(this.orderRepository)
      .execute(searchOrdersDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}

