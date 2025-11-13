import { OrderEntity } from "../../entities/order.entity";
import { GetOrdersOptionalFiltersDto } from "../../dto/order/get-orders-optional-filters.dto";
import { OrderRepository } from "../../repositories/order.repository";
import { PaginateResponse } from "../../interfaces/shared/paginated-response.interface";

/**
 * Caso de uso para obtener órdenes con filtros opcionales y paginación
 */
interface GetOrdersOptionalFiltersUseCase {
  execute(dto: GetOrdersOptionalFiltersDto): Promise<PaginateResponse<OrderEntity>>;
}

export class GetOrdersOptionalFiltersUseCaseImpl implements GetOrdersOptionalFiltersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(dto: GetOrdersOptionalFiltersDto): Promise<PaginateResponse<OrderEntity>> {
    return this.orderRepository.getOrders(dto);
  }
}

