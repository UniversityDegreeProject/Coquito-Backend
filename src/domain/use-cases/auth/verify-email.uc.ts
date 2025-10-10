import { JwtAdapter } from "../../../config";
import { UpdateUserDto } from "../../dto/user/update-user.dto";
import { HttpCustomErrors } from "../../errors/http-custom-errors";
import { UserRepository } from "../../repositories";

export interface VerifyEmailUseCase {
  execute(token: string): Promise<{ message: string }>;
}

export class VerifyEmailUseCaseImpl implements VerifyEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter
  ) {}

  async execute(token: string): Promise<{ message: string }> {
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

