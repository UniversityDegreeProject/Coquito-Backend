import { CustomerEntity } from "../../entities/customer.entity";
import { CreateCustomerDto } from "../../dto/customer/create-customer.dto";
import { CustomerRepository } from "../../repositories/customer.repository";

interface CreateCustomerUseCase {
  execute(customer: CreateCustomerDto): Promise<CustomerEntity>;
}

export class CreateCustomerUseCaseImpl implements CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  execute(customer: CreateCustomerDto): Promise<CustomerEntity> {
    return this.customerRepository.createCustomer(customer);
  }
}

