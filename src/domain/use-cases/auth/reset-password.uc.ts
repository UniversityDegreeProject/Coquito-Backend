import { ResetPasswordDto } from "../../dto/auth/reset-password.dto";
import { UpdateUserDto } from "../../dto/user/update-user.dto";
import { UserRepository } from "../../repositories";
import { JwtAdapter } from "../../../config";
import { HttpCustomErrors } from "../../errors/http-custom-errors";

export interface ResetPasswordUseCase {
  execute(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }>;
}

export class ResetPasswordUseCaseImpl implements ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter
  ) {}

  async execute(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const payload = this.jwtAdapter.verifyToken<{ id: string; email: string }>(token);

    if (!payload || !payload.id || !payload.email) {
      throw HttpCustomErrors.badRequest("Token inválido o expirado");
    }

    const user = await this.userRepository.getUserById(payload.id);

    const [error, updateUserDto] = UpdateUserDto.create({
      id: user.id,
      password: newPassword
    });

    if (error) throw HttpCustomErrors.badRequest(error);
    if (!updateUserDto) throw HttpCustomErrors.badRequest("Error al crear DTO de actualización");

    await this.userRepository.updateUser(updateUserDto);

    return { message: "Contraseña actualizada exitosamente" };
  }
}

