import { 
  CustomerEntity, 
  CustomerDatasource, 
  CustomerRepository, 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  GetCustomerByIdDto, 
  DeleteCustomerByIdDto, 
  PaginateResponse,
  CustomersOptionalFiltersDto,
} from "../../domain";

export class CustomerRepositoryImpl implements CustomerRepository {
  constructor(
    private readonly customerDatasource: CustomerDatasource
  ) {}

  getCustomers(customersOptionalFiltersDto: CustomersOptionalFiltersDto): Promise<PaginateResponse<CustomerEntity>> {
    return this.customerDatasource.getCustomers(customersOptionalFiltersDto);
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

}

