import { CustomerEntity } from "../entities/customer.entity";
import { CreateCustomerDto } from "../dto/customer/create-customer.dto";
import { UpdateCustomerDto } from "../dto/customer/update-customer.dto";
import { GetCustomerByIdDto } from "../dto/customer/get-customer-by-id.dto";
import { DeleteCustomerByIdDto } from "../dto/customer/delete-customer-by-id.dto";
import { SearchCustomersDto } from "../dto/customer/search-customers.dto";

export abstract class CustomerRepository {
  abstract getCustomers(): Promise<CustomerEntity[]>;
  abstract createCustomer(customer: CreateCustomerDto): Promise<CustomerEntity>;
  abstract updateCustomer(customer: UpdateCustomerDto): Promise<CustomerEntity>;
  abstract deleteCustomer(id: DeleteCustomerByIdDto): Promise<CustomerEntity>;
  abstract getCustomerById(id: GetCustomerByIdDto): Promise<CustomerEntity>;
  abstract searchCustomers(searchCustomersDto: SearchCustomersDto): Promise<{
    customers: CustomerEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

