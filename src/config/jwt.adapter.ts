import jwt, { SignOptions } from "jsonwebtoken";
import { HttpCustomErrors } from "../domain/errors/http-custom-errors";


export class JwtAdapter {

  constructor(
    private readonly jwtSeed: string
  ) {}

  /**
   * Genera un token JWT con el payload proporcionado
   * @param payload - Datos a incluir en el token (ej: { id: userId })
   * @param duration - Duración del token (por defecto "1h")
   * @returns Promise que resuelve el token o null en caso de error
   */
  async generateToken(payload: object, duration: string | number = "1h"): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(payload, this.jwtSeed, { expiresIn: duration as SignOptions["expiresIn"] }, (err, token) => {
        if (err) return resolve(null);
        resolve(token ?? null);
      });
    });
  }

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token JWT a verificar
   * @returns Payload del token o null si es inválido
   */
  verifyToken<T = any>(token: string): T {
    if( !token ) throw HttpCustomErrors.badRequest("Token no proporcionado");
    try {

      return jwt.verify(token, this.jwtSeed) as T;
    } catch (error) {
      throw HttpCustomErrors.badRequest("Token inválido o expirado");
    }
  } 
}













