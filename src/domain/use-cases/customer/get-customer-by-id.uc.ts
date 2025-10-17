import { CustomerEntity } from "../../entities/customer.entity";
import { GetCustomerByIdDto } from "../../dto/customer/get-customer-by-id.dto";
import { CustomerRepository } from "../../repositories/customer.repository";

interface GetCustomerByIdUseCase {
  execute(id: GetCustomerByIdDto): Promise<CustomerEntity>;
}

export class GetCustomerByIdUseCaseImpl implements GetCustomerByIdUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  execute(id: GetCustomerByIdDto): Promise<CustomerEntity> {
    return this.customerRepository.getCustomerById(id);
  }
}

