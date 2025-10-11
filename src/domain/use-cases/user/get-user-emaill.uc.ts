
import { GetUserByEmailDto } from "../../dto/user";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";

interface GetUserEmailUseCase {
  execute(email: GetUserByEmailDto): Promise<UserEntity>;
}

export class GetUserEmailUseCaseImpl implements GetUserEmailUseCase {

  constructor(private readonly userRepository: UserRepository) {}

  execute(email: GetUserByEmailDto): Promise<UserEntity> {
    return this.userRepository.getUserByEmail(email);
  }
}