import { AuthDatasource, AuthRepository, LoginUserDto, UserEntity } from "../../domain";


export class AuthRepositoryImpl implements AuthRepository{
  constructor(
    private readonly authDatasource: AuthDatasource
  ) {
    
  }
  loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    return this.authDatasource.loginUser(loginUserDto);
  }
}