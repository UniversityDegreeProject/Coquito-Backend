import { RegisterUserDto } from "../../dto/auth/register-user.dto";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";
import { BcryptAdapter } from "../../../config";


export interface CreateUserUseCase {
  execute(user: RegisterUserDto): Promise<UserEntity>;
}


export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcrypt: BcryptAdapter
  ) {}

  private async generateDefaultPassword(firstName: string, lastName : string): Promise<string> {
    const getCodeFirstName = firstName.charAt(0).toUpperCase() + firstName.charAt(1).toLowerCase();
    const getCodeLastName = lastName.charAt(0).toUpperCase() + lastName.charAt(1).toLowerCase();
    const currentYear = new Date().getFullYear();
    const passwordGenerated = `${getCodeFirstName}${getCodeLastName}${currentYear}@`;
    const encryptedPassword = await this.bcrypt.hash(passwordGenerated);
    return encryptedPassword;
  }

  async execute(user: RegisterUserDto): Promise<UserEntity> {

    const { firstName, lastName, email, username, phone, role, status, password } = user;

    if( !password ) {
      const hashedPassword = await this.generateDefaultPassword(firstName, lastName);
      user = new RegisterUserDto(username, email, firstName, lastName, phone, role, status, hashedPassword);

      return this.userRepository.createUser(user);
    }

    return this.userRepository.createUser(user);
  }
}
