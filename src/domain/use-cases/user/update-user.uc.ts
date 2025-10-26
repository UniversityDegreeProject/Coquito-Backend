import { BcryptAdapter } from "../../../config";
import { UpdateUserDto } from "../../dto/user";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";

interface UpdateUserUseCase {
  execute(user: UpdateUserDto): Promise<UserEntity>;
}


export class UpdateUserUseCaseImpl implements UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcrypt : BcryptAdapter
  ) {}

  async execute(user: UpdateUserDto): Promise<UserEntity> {

    const { id, password, email, username, firstName, lastName, status, role, phone, updatedAt, emailVerified } = user;

    if( password ) {
      const hashedPassword = await this.bcrypt.hash(password);
      user = new UpdateUserDto(id, username, emailVerified, hashedPassword, email, firstName, lastName, status, role, phone, updatedAt);
      
      return this.userRepository.updateUser(user);
    }

    return this.userRepository.updateUser(user);
  }
}
