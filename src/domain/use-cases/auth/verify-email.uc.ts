import { AuthRepository, UserRepository } from "../../repositories";

export interface VerifyEmailUseCase {
  execute(token: string): Promise<{ message: string }>;
}

export class VerifyEmailUseCaseImpl implements VerifyEmailUseCase {
  constructor(
    private readonly authRepository: AuthRepository
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    return this.authRepository.verifyEmail(token);
  }
}

