import { UserEntity, RegisterUserDto, UpdateUserDto, UserDatasource, UserRepository, GetUserByIdDto, GetUserByEmailDto, DeleteUserByIdDto } from "../../domain";


export class UserRepositoryImpl implements UserRepository {


  constructor(
    private readonly userDatasource: UserDatasource
  ) {
  }


  getUsers(): Promise<UserEntity[]> {
    return this.userDatasource.getUsers();
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
  getUserByUsername(username: string): Promise<UserEntity> {
    return this.userDatasource.getUserByUsername(username);
  }
}