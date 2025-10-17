import { CustomerEntity } from "../../entities/customer.entity";
import { CustomerRepository } from "../../repositories/customer.repository";

interface GetCustomersUseCase {
  execute(): Promise<CustomerEntity[]>;
}

export class GetCustomersUseCaseImpl implements GetCustomersUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  execute(): Promise<CustomerEntity[]> {
    return this.customerRepository.getCustomers();
  }
}

