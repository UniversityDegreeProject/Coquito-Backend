import { OrderEntity } from "../../entities/order.entity";
import { GetOrderByIdDto } from "../../dto/order/get-order-by-id.dto";
import { OrderRepository } from "../../repositories/order.repository";

/**
 * Caso de uso para obtener una orden por su ID
 */
interface GetOrderByIdUseCase {
  execute(dto: GetOrderByIdDto): Promise<OrderEntity>;
}

export class GetOrderByIdUseCaseImpl implements GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(dto: GetOrderByIdDto): Promise<OrderEntity> {
    return this.orderRepository.getOrderById(dto);
  }
}

