import { ResetPasswordDto } from "../../dto/auth/reset-password.dto";
import { GetUserByIdDto } from "../../dto/user";
import { UpdateUserDto } from "../../dto/user/update-user.dto";
import { UserRepository } from "../../repositories";
import { BcryptAdapter, JwtAdapter } from "../../../config";
import { HttpCustomErrors } from "../../errors/http-custom-errors";
import { UpdateUserUseCaseImpl } from "../user";

export interface ResetPasswordUseCase {
  execute(resetPasswordDto: ResetPasswordDto): Promise<{ message: string; userId: string }>;
}

export class ResetPasswordUseCaseImpl implements ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly bcrypt: BcryptAdapter
  ) {}

  async execute(resetPasswordDto: ResetPasswordDto): Promise<{ message: string; userId: string }> {
    const { token, newPassword } = resetPasswordDto;

    const payload = this.jwtAdapter.verifyToken<{ id: string; email: string }>(token);

    if (!payload || !payload.id || !payload.email) {
      throw HttpCustomErrors.badRequest("Token inválido o expirado, comuniquese con su administrador");
    }

    const [errorOfId, getUserByIdDto] = GetUserByIdDto.create({ id: payload.id });
    if( errorOfId ) throw HttpCustomErrors.badRequest(errorOfId);
    if( !getUserByIdDto ) throw HttpCustomErrors.badRequest("User not found");

    const user = await this.userRepository.getUserById(getUserByIdDto);

    const [error, updateUserDto] = UpdateUserDto.create({ ...user, password: newPassword});

    if (error) throw HttpCustomErrors.badRequest(error);
    if (!updateUserDto) throw HttpCustomErrors.badRequest("Error al crear DTO de actualización");

    await new UpdateUserUseCaseImpl(this.userRepository, this.bcrypt).execute(updateUserDto);

    return { message: "Contraseña actualizada exitosamente", userId: user.id };
  }
}

