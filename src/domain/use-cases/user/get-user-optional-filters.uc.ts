import { GetUserOptionalFiltersDto } from "../../dto/user";
import { PaginateResponse } from "../../interfaces/shared";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";

interface GetUserOptionalFiltersUseCase {
  execute(getUserOptionalFiltersDto: GetUserOptionalFiltersDto): Promise<PaginateResponse<UserEntity>>;
}

export class GetUserOptionalFiltersUseCaseImpl implements GetUserOptionalFiltersUseCase {
  
  constructor(private readonly userRepository: UserRepository) {}

  execute(getUserOptionalFiltersDto: GetUserOptionalFiltersDto): Promise<PaginateResponse<UserEntity>> {
    return this.userRepository.getUsers(getUserOptionalFiltersDto);
  }
}