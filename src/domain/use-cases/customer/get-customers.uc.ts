
import { CustomerEntity } from "../../entities/customer.entity";
import { PaginateResponse, CustomersOptionalFiltersDto } from "../../";
import { CustomerRepository } from "../../repositories/customer.repository";

interface GetCustomersUseCase {
  execute(customersOptionalFiltersDto: CustomersOptionalFiltersDto): Promise<PaginateResponse<CustomerEntity>>;
}

export class GetCustomersUseCaseImpl implements GetCustomersUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  execute(customersOptionalFiltersDto: CustomersOptionalFiltersDto): Promise<PaginateResponse<CustomerEntity>> {
    return this.customerRepository.getCustomers(customersOptionalFiltersDto);
  }
}

