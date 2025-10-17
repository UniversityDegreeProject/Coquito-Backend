import { 
  CustomerEntity, 
  CustomerDatasource, 
  CustomerRepository, 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  GetCustomerByIdDto, 
  DeleteCustomerByIdDto, 
  SearchCustomersDto 
} from "../../domain";

export class CustomerRepositoryImpl implements CustomerRepository {
  constructor(
    private readonly customerDatasource: CustomerDatasource
  ) {}

  getCustomers(): Promise<CustomerEntity[]> {
    return this.customerDatasource.getCustomers();
  }

  createCustomer(customer: CreateCustomerDto): Promise<CustomerEntity> {
    return this.customerDatasource.createCustomer(customer);
  }

  updateCustomer(customer: UpdateCustomerDto): Promise<CustomerEntity> {
    return this.customerDatasource.updateCustomer(customer);
  }

  deleteCustomer(id: DeleteCustomerByIdDto): Promise<CustomerEntity> {
    return this.customerDatasource.deleteCustomer(id);
  }

  getCustomerById(id: GetCustomerByIdDto): Promise<CustomerEntity> {
    return this.customerDatasource.getCustomerById(id);
  }

  searchCustomers(searchCustomersDto: SearchCustomersDto): Promise<{
    customers: CustomerEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.customerDatasource.searchCustomers(searchCustomersDto);
  }
}

