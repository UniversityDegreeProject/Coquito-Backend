import { UserEntity, RegisterUserDto, UpdateUserDto, UserDatasource, UserRepository, GetUserByIdDto, GetUserByEmailDto, DeleteUserByIdDto, PaginateResponse, GetUserOptionalFiltersDto } from "../../domain";


export class UserRepositoryImpl implements UserRepository {


  constructor(
    private readonly userDatasource: UserDatasource
  ) {
  }


  getUsers( getUserOptionalFiltersDto: GetUserOptionalFiltersDto ): Promise<PaginateResponse<UserEntity>> {
    return this.userDatasource.getUsers(getUserOptionalFiltersDto);
  }
  createUser(user: RegisterUserDto): Promise<UserEntity> {
    return this.userDatasource.createUser(user);
  }
  updateUser(user: UpdateUserDto): Promise<UserEntity> {
    return this.userDatasource.updateUser(user);
  }
  deleteUser(id: DeleteUserByIdDto): Promise<UserEntity> {
    return this.userDatasource.deleteUser(id);
  }
  getUserById(id: GetUserByIdDto): Promise<UserEntity> {
    return this.userDatasource.getUserById(id);
  }
  getUserByEmail(email: GetUserByEmailDto): Promise<UserEntity> {
    return this.userDatasource.getUserByEmail(email);
  }
  
  // Métodos para Refresh Token
  saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    return this.userDatasource.saveRefreshToken(userId, refreshToken);
  }
  getUserByRefreshToken(refreshToken: string): Promise<UserEntity> {
    return this.userDatasource.getUserByRefreshToken(refreshToken);
  }
  removeRefreshToken(userId: string): Promise<void> {
    return this.userDatasource.removeRefreshToken(userId);
  }
}