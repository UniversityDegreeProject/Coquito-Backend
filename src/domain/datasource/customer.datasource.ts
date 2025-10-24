import { CustomerEntity } from "../entities/customer.entity";
import { CreateCustomerDto } from "../dto/customer/create-customer.dto";
import { UpdateCustomerDto } from "../dto/customer/update-customer.dto";
import { GetCustomerByIdDto } from "../dto/customer/get-customer-by-id.dto";
import { DeleteCustomerByIdDto } from "../dto/customer/delete-customer-by-id.dto";
import { CustomersOptionalFiltersDto, PaginateResponse } from "../";

export abstract class CustomerDatasource {
  abstract getCustomers(customersOptionalFiltersDto: CustomersOptionalFiltersDto): Promise<PaginateResponse<CustomerEntity>>;
  abstract createCustomer(customer: CreateCustomerDto): Promise<CustomerEntity>;
  abstract updateCustomer(customer: UpdateCustomerDto): Promise<CustomerEntity>;
  abstract deleteCustomer(id: DeleteCustomerByIdDto): Promise<CustomerEntity>;
  abstract getCustomerById(id: GetCustomerByIdDto): Promise<CustomerEntity>;
}

