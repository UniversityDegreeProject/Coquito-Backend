import { prismaClient } from "../../data/postgres";
import { AuthDatasource, HttpCustomErrors, LoginUserDto, UserEntity } from "../../domain";
import { BcryptAdapter } from "../../config";

 
export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly bcrypt: BcryptAdapter,
  ) {
    
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { username, password } = loginUserDto;
    
    const user = await prismaClient.user.findUnique({
      where: { username }
    });
    if (!user) throw HttpCustomErrors.notFound("Usuario no encontrado");
    
    //? Validamos que el email este verificado
    if (!user.emailVerified) {
      throw HttpCustomErrors.forbidden("Debes verificar tu email antes de iniciar sesión. Revisa la bandeja de entrada o spam de tu email.");
    }
    
    const isPasswordValid = await this.bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw HttpCustomErrors.unauthorized("Credenciales incorrectas");
    
    return UserEntity.mapFromPrisma(user);
  }


}