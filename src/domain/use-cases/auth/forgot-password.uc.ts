import { ForgotPasswordDto } from "../../dto/auth/forgot-password.dto";
import { UserRepository } from "../../repositories";
import { JwtAdapter } from "../../../config";
import { EmailService } from "../../../domain/services/email.service";

export interface ForgotPasswordUseCase {
  execute(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }>;
}

export class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly emailService: EmailService
  ) {}

  async execute(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.getUserByEmail(email);

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

    return { message: "Se ha enviado un email para restablecer tu contraseña" };
  }
}

