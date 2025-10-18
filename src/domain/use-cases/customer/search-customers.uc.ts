import { CustomerEntity } from "../../entities/customer.entity";
import { SearchCustomersDto } from "../../dto/customer/search-customers.dto";
import { CustomerRepository } from "../../repositories/customer.repository";

interface SearchCustomersUseCase {
  execute(searchCustomersDto: SearchCustomersDto): Promise<{
    customers: CustomerEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export class SearchCustomersUseCaseImpl implements SearchCustomersUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  execute(searchCustomersDto: SearchCustomersDto): Promise<{
    customers: CustomerEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.customerRepository.searchCustomers(searchCustomersDto);
  }
}

