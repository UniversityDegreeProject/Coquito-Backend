import { prismaClient } from "../../data/postgres";
import { AuthDatasource, HttpCustomErrors, LoginUserDto, UpdateUserDto, UserEntity, UserRepository } from "../../domain";
import { BcryptAdapter, JwtAdapter } from "../../config";


export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly bcrypt: BcryptAdapter,
    private readonly jwtAdapter: JwtAdapter,
    private readonly userRepository: UserRepository
  ) {
    
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { username, password } = loginUserDto;
    
    const user = await prismaClient.user.findUnique({
      where: { username }
    });
    if (!user) throw HttpCustomErrors.notFound("Credenciales incorrectas");
    
    //? Validar que el email esté verificado
    if (!user.emailVerified) {
      throw HttpCustomErrors.forbidden("Debes verificar tu email antes de iniciar sesión. Revisa la bandeja de entrada o spam de tu email.");
    }
    
    const isPasswordValid = await this.bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw HttpCustomErrors.unauthorized("Credenciales incorrectas");
    
    return UserEntity.mapFromPrisma(user);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const payload = this.jwtAdapter.verifyToken<{ id: string; email: string }>(token);
    
    if (!payload || !payload.id || !payload.email) {
      throw HttpCustomErrors.badRequest("Token inválido o expirado");
    }

    const user = await this.userRepository.getUserById(payload.id);

    if (user.emailVerified) {
      return { message: "Tu email ya estaba verificado. Puedes iniciar sesión." };
    }

    const [error, updateUserDto] = UpdateUserDto.create({
      id: user.id,
      emailVerified: true
    });
    
    if (error) throw HttpCustomErrors.badRequest(error);
    if (!updateUserDto) throw HttpCustomErrors.badRequest("Error al crear DTO de actualización");

    await this.userRepository.updateUser(updateUserDto);

    return { message: "Email verificado exitosamente. Ya puedes iniciar sesión." };
  }
}