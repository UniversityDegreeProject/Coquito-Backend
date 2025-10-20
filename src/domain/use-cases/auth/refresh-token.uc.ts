import { JwtAdapter } from "../../../config";
import { RefreshTokenDto } from "../../dto/auth/refresh-token.dto";
import { HttpCustomErrors } from "../../errors/http-custom-errors";
import { UserRepository } from "../../repositories";

/**
 * Caso de uso para renovar el access token usando un refresh token
 * 
 * Flujo:
 * 1. Validar que el refresh token sea válido
 * 2. Verificar que el refresh token exista en la base de datos
 * 3. Verificar que el usuario esté activo
 * 4. Generar un nuevo access token (1 hora)
 * 5. Generar un nuevo refresh token (7 días)
 * 6. Guardar el nuevo refresh token en la base de datos
 * 7. Retornar ambos tokens
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto) {
    // 1. Validar el refresh token con JWT
    const decoded = this.jwtAdapter.verifyToken<{ id: string }>(
      refreshTokenDto.refreshToken
    );

    if (!decoded || !decoded.id) {
      throw HttpCustomErrors.unauthorized("Refresh token inválido");
    }

    // 2. Buscar usuario por refresh token en la base de datos
    const user = await this.userRepository.getUserByRefreshToken(
      refreshTokenDto.refreshToken
    );

    // 3. Verificar que el usuario esté activo
    if (user.status !== "Activo") {
      throw HttpCustomErrors.forbidden("Usuario inactivo o suspendido");
    }

    // 4. Generar nuevo access token (1 hora)
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = await this.jwtAdapter.generateAccessToken(payload);
    if (!newAccessToken) {
      throw HttpCustomErrors.internalServerError("Error al generar access token");
    }

    // 5. Generar nuevo refresh token (7 días)
    const newRefreshToken = await this.jwtAdapter.generateRefreshToken({
      id: user.id,
    });
    if (!newRefreshToken) {
      throw HttpCustomErrors.internalServerError("Error al generar refresh token");
    }

    // 6. Guardar el nuevo refresh token en la base de datos
    await this.userRepository.saveRefreshToken(user.id, newRefreshToken);

    // 7. Retornar usuario y tokens
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastConnection: user.lastConnection,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

