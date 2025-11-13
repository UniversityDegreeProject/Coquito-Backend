import { OrderEntity } from "../entities/order.entity";
import { CreateOrderDto } from "../dto/order/create-order.dto";
import { GetOrderByIdDto } from "../dto/order/get-order-by-id.dto";
import { GetOrdersOptionalFiltersDto } from "../dto/order/get-orders-optional-filters.dto";
import { PaginateResponse } from "../interfaces/shared/paginated-response.interface";

/**
 * Datasource abstracto para Orders
 * Define las operaciones que debe implementar cualquier datasource de órdenes
 */
export abstract class OrderDatasource {
  /**
   * Crea una nueva orden (venta)
   * - Valida stock disponible (productos fijos y batches)
   * - Reduce stock automáticamente
   * - Crea StockMovement tipo "Venta" para cada producto
   * - Actualiza totales en CashRegister
   * - Calcula subtotal, tax, total y vuelto
   */
  abstract createOrder(dto: CreateOrderDto): Promise<OrderEntity>;

  /**
   * Obtiene una orden por su ID
   * Incluye items, customer, user y cashRegister
   */
  abstract getOrderById(dto: GetOrderByIdDto): Promise<OrderEntity>;

  /**
   * Obtiene órdenes con filtros opcionales y paginación
   */
  abstract getOrders(dto: GetOrdersOptionalFiltersDto): Promise<PaginateResponse<OrderEntity>>;
}

