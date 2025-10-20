import {
  refreshTokenSchema,
  RefreshTokenSchema,
} from "../../schemas/auth/refresh-token-validator.schema";

/**
 * DTO para renovar el access token usando el refresh token
 */
export class RefreshTokenDto {
  private constructor(public readonly refreshToken: string) {}

  /**
   * Crea una instancia validada del DTO
   * @param object - Objeto con el refreshToken
   * @returns Instancia validada del DTO
   * @throws Error si la validación falla
   */
  static create(object: RefreshTokenSchema): [ string?, RefreshTokenDto? ] {
    // Validar con Zod
    const result = refreshTokenSchema.safeParse(object);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return [firstError?.message, undefined];
    }
    const { refreshToken } = result.data;

    // Crear instancia
    return [undefined, new RefreshTokenDto(refreshToken)];
  }
}

