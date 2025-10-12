import { UserRepository } from "../../repositories";
import { SearchUsersDto } from "../../dto/user/search-users.dto";
import { UserEntity } from "../../entities";

export interface SearchUsersUseCase {
  execute(searchUsersDto: SearchUsersDto): Promise<{
    users: UserEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export class SearchUsersUseCaseImpl implements SearchUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute(searchUsersDto: SearchUsersDto): Promise<{
    users: UserEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.userRepository.searchUsers(searchUsersDto);
  }
}

