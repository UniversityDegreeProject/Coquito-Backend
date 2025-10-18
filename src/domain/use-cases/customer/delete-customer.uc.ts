import { CustomerEntity } from "../../entities/customer.entity";
import { DeleteCustomerByIdDto } from "../../dto/customer/delete-customer-by-id.dto";
import { CustomerRepository } from "../../repositories/customer.repository";

interface DeleteCustomerUseCase {
  execute(id: DeleteCustomerByIdDto): Promise<CustomerEntity>;
}

export class DeleteCustomerUseCaseImpl implements DeleteCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  execute(id: DeleteCustomerByIdDto): Promise<CustomerEntity> {
    return this.customerRepository.deleteCustomer(id);
  }
}

