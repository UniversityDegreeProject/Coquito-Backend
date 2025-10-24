import { CustomerEntity } from "../../entities/customer.entity";
import { CreateCustomerDto } from "../../dto/customer/create-customer.dto";
import { CustomerRepository } from "../../repositories/customer.repository";
import { BcryptAdapter } from "../../../config";

interface CreateCustomerUseCase {
  execute(customer: CreateCustomerDto): Promise<CustomerEntity>;
}

export class CreateCustomerUseCaseImpl implements CreateCustomerUseCase {

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly bcrypt: BcryptAdapter
  ) {}

 private async generateDefaultPassword(firstName: string): Promise<string> {
   const password = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() + "@";
   const encryptedPassword = await this.bcrypt.hash(password);
   return encryptedPassword;
 }

   async execute(customer: CreateCustomerDto): Promise<CustomerEntity> {

    const { password, firstName, lastName, email, phone, address, type } = customer;
    if (!password) {
      const hashedPassword = await this.generateDefaultPassword(firstName);
      customer = new CreateCustomerDto(firstName, lastName, email, hashedPassword, phone, address, type);
    }

    return this.customerRepository.createCustomer(customer);
  }
}

