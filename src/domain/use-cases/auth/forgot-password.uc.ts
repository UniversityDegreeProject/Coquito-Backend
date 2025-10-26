import { ForgotPasswordDto } from "../../dto/auth/forgot-password.dto";
import { GetUserByEmailDto } from "../../dto/user";
import { UserRepository } from "../../repositories";
import { JwtAdapter } from "../../../config";
import { EmailService } from "../../../domain/services/email.service";
import { HttpCustomErrors } from "../../errors/http-custom-errors";

export interface ForgotPasswordUseCase {
  execute(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }>;
}

export class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly emailService: EmailService
  ) {}

  async execute (forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const [error, getUserByEmailDto] = GetUserByEmailDto.create({ email: email });
    if( error ) throw HttpCustomErrors.badRequest(error);
    if( !getUserByEmailDto ) throw HttpCustomErrors.badRequest("User not found");

    const user = await this.userRepository.getUserByEmail(getUserByEmailDto);

    const token = await this.jwtAdapter.generateToken(
      { id: user.id, email: user.email },
      "15m"
    );

    if (!token) {
      return { message: "Error al generar el token" };
    }

    const emailSent = await this.emailService.sendPasswordRecovery(
      user.email,
      user.username,
      token
    );

    if (!emailSent) {
      return { message: "Error al enviar el email" };
    }

    return { message: "Se ha enviado un correo electronico para cambiar su contraseña" };
  }
}

