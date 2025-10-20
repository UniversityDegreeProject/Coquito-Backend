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
   * Genera un Access Token (corta duración: 1 hora)
   * @param payload - Datos a incluir en el token (ej: { id, username, email, role })
   * @returns Promise que resuelve el token o null en caso de error
   */
  async generateAccessToken(payload: object): Promise<string | null> {
    return this.generateToken(payload, "1h");
  }

  /**
   * Genera un Refresh Token (larga duración: 7 días)
   * @param payload - Datos a incluir en el token (ej: { id })
   * @returns Promise que resuelve el token o null en caso de error
   */
  async generateRefreshToken(payload: object): Promise<string | null> {
    return this.generateToken(payload, "7d");
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













