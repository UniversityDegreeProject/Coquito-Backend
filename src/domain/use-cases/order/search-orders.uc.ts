import { OrderEntity } from "../../entities/order.entity";
import { SearchOrdersDto } from "../../dto/order/search-orders.dto";
import { OrderRepository } from "../../repositories/order.repository";
import { PaginateResponse } from "../../interfaces/shared/paginated-response.interface";

/**
 * Caso de uso para buscar órdenes con filtros y paginación
 */
interface SearchOrdersUseCase {
  execute(dto: SearchOrdersDto): Promise<PaginateResponse<OrderEntity>>;
}

export class SearchOrdersUseCaseImpl implements SearchOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(dto: SearchOrdersDto): Promise<PaginateResponse<OrderEntity>> {
    return this.orderRepository.searchOrders(dto);
  }
}

