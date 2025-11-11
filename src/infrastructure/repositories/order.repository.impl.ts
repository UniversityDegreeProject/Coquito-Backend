import {
  OrderEntity,
  OrderDatasource,
  OrderRepository,
  CreateOrderDto,
  GetOrderByIdDto,
  SearchOrdersDto,
  PaginateResponse,
} from "../../domain";

export class OrderRepositoryImpl implements OrderRepository {
  constructor(private readonly orderDatasource: OrderDatasource) {}

  createOrder(dto: CreateOrderDto): Promise<OrderEntity> {
    return this.orderDatasource.createOrder(dto);
  }

  getOrderById(dto: GetOrderByIdDto): Promise<OrderEntity> {
    return this.orderDatasource.getOrderById(dto);
  }

  searchOrders(dto: SearchOrdersDto): Promise<PaginateResponse<OrderEntity>> {
    return this.orderDatasource.searchOrders(dto);
  }
}

