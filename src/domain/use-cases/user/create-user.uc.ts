import { RegisterUserDto } from "../../dto/auth/register-user.dto";
import { UserEntity } from "../../entities";
import { UserRepository } from "../../repositories";


export interface CreateUserUseCase {
  execute(user: RegisterUserDto): Promise<UserEntity>;
}


export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  execute(user: RegisterUserDto): Promise<UserEntity> {
    const ensurePassword = (user: RegisterUserDto): RegisterUserDto => {
      if (user.password && user.password !== undefined && user.password !== null && user.password !== "") return user;
      
      //? Política: Primeras 2 iniciales del nombre (minúsculas) + Primeras 2 iniciales del apellido (mayúsculas) + Año actual + @
      const firstNameInitials = user.firstName.substring(0, 1).toUpperCase().substring(1,2).toLowerCase();
      const lastNameInitials = user.lastName.substring(0, 1).toUpperCase().substring(1,2).toLowerCase();
      const currentYear = new Date().getFullYear();
      const passwordGenerated = `${firstNameInitials}${lastNameInitials}${currentYear}@`;
      
      // Retornar un nuevo DTO con la contraseña generada
      return new RegisterUserDto(user.username, user.email, user.firstName, user.lastName, user.phone, user.role, user.status, passwordGenerated);
    }
    const userWithPassword = ensurePassword(user);

    return this.userRepository.createUser(userWithPassword);
  }
}
