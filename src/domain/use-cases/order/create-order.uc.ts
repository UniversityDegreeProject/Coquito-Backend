import { OrderEntity } from "../../entities/order.entity";
import { CreateOrderDto } from "../../dto/order/create-order.dto";
import { OrderRepository } from "../../repositories/order.repository";

/**
 * Caso de uso para crear una nueva orden (venta)
 * Valida stock, reduce inventario, crea movimientos de stock y actualiza caja
 */
interface CreateOrderUseCase {
  execute(dto: CreateOrderDto): Promise<OrderEntity>;
}

export class CreateOrderUseCaseImpl implements CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(dto: CreateOrderDto): Promise<OrderEntity> {
    return this.orderRepository.createOrder(dto);
  }
}

