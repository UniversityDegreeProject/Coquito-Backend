import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";

export interface GetUsersUseCase {
  execute(): Promise<UserEntity[]>;
}


export class GetUsersUseCaseImpl implements GetUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  execute(): Promise<UserEntity[]> {
    return this.userRepository.getUsers();
  }
}