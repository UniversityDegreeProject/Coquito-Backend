import { hash, compare, genSaltSync } from 'bcryptjs';

/**
 * Adapter de Bcrypt para hash y comparación de contraseñas
 * Encapsula la biblioteca bcryptjs siguiendo Clean Architecture
 */
export class BcryptAdapter {
  /**
   * Hash de una contraseña con salt de 10 rounds
   * @param password - Contraseña en texto plano
   * @returns Promise con el hash de la contraseña
   */
  async hash(password: string): Promise<string> {
    const salt = genSaltSync(10);
    return hash(password, salt);
  }

  /**
   * Compara una contraseña en texto plano con un hash
   * @param password - Contraseña en texto plano
   * @param hash - Hash a comparar
   * @returns Promise<boolean> - true si coinciden
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
