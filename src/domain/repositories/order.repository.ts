import { OrderEntity } from "../entities/order.entity";
import { CreateOrderDto } from "../dto/order/create-order.dto";
import { GetOrderByIdDto } from "../dto/order/get-order-by-id.dto";
import { GetOrdersOptionalFiltersDto } from "../dto/order/get-orders-optional-filters.dto";
import { PaginateResponse } from "../interfaces/shared/paginated-response.interface";

/**
 * Repository abstracto para Orders
 * Define las operaciones que debe implementar cualquier repository de órdenes
 */
export abstract class OrderRepository {
  abstract createOrder(dto: CreateOrderDto): Promise<OrderEntity>;
  abstract getOrderById(dto: GetOrderByIdDto): Promise<OrderEntity>;
  abstract getOrders(dto: GetOrdersOptionalFiltersDto): Promise<PaginateResponse<OrderEntity>>;
}

