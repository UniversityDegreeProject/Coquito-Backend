import { CustomerEntity } from "../../entities/customer.entity";
import { UpdateCustomerDto } from "../../dto/customer/update-customer.dto";
import { CustomerRepository } from "../../repositories/customer.repository";

interface UpdateCustomerUseCase {
  execute(customer: UpdateCustomerDto): Promise<CustomerEntity>;
}

export class UpdateCustomerUseCaseImpl implements UpdateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  execute(customer: UpdateCustomerDto): Promise<CustomerEntity> {
    return this.customerRepository.updateCustomer(customer);
  }
}

