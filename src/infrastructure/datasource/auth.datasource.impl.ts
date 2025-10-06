import { prismaClient } from "../../data/postgres";
import { AuthDatasource, HttpCustomErrors, LoginUserDto, UserEntity } from "../../domain";
import { bcrypt } from "../../config";


export class AuthDatasourceImpl implements AuthDatasource {

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { username, password } = loginUserDto;
    
    const user = await prismaClient.user.findUnique({
      where: { username }
    });
    
    if (!user) throw HttpCustomErrors.notFound("El usuario no existe o es incorrecto");
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw HttpCustomErrors.unauthorized("Invalid password");
    
    return UserEntity.mapFromPrisma(user);
  }

}