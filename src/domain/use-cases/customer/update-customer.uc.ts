import { CustomerEntity } from "../../entities/customer.entity";
import { UpdateCustomerDto } from "../../dto/customer/update-customer.dto";
import { CustomerRepository } from "../../repositories/customer.repository";
import { BcryptAdapter } from "../../../config";

interface UpdateCustomerUseCase {
  execute(customer: UpdateCustomerDto): Promise<CustomerEntity>;
}

export class UpdateCustomerUseCaseImpl implements UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly bcrypt: BcryptAdapter
  ) {}



  async execute(customer: UpdateCustomerDto): Promise<CustomerEntity> {
    const { id, firstName, lastName, email, phone, address, type, updatedAt } = customer;

    if (customer.password) {
      const hassPassword = await this.bcrypt.hash(customer.password!);
      const customerWithHashedPassword = new UpdateCustomerDto(id, firstName, lastName, email, phone, address, hassPassword, type, updatedAt);
      return this.customerRepository.updateCustomer(customerWithHashedPassword);
    }

    return this.customerRepository.updateCustomer(customer);

  }
}
