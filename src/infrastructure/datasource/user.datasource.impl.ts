import { prismaClient } from "../../data/postgres";
import { RegisterUserDto, UpdateUserDto, UserDatasource, UserEntity } from "../../domain";
import { HttpCustomErrors } from "../../domain/errors/http-custom-errors";
import { bcrypt } from "../../config";


export class UserDatasourceImpl implements UserDatasource {


  async getUsers(): Promise<UserEntity[]> {
    const users = await prismaClient.user.findMany();
    return users.map(user => UserEntity.mapFromPrisma(user));
  }

  async getUserByUsername(username: string): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { username },
    });
    
    if (!user) throw HttpCustomErrors.notFound("User not found");
    
    return UserEntity.mapFromPrisma(user);
  }

  async getUserById(id: string | number): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { id: id.toString() },
    });

    if (!user) throw HttpCustomErrors.notFound("User not found");
    
    return UserEntity.mapFromPrisma(user);
  }


  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { email },
    });
    
    if (!user) throw HttpCustomErrors.notFound("Usuario no encontrado");
    
    return UserEntity.mapFromPrisma(user);
  }


  async createUser(user: RegisterUserDto): Promise<UserEntity> {
    const { password, ...rest } = user;
    
    const existingUserByEmail = await prismaClient.user.findUnique({
      where: { email: user.email }
    });
    
    if (existingUserByEmail) {
      throw HttpCustomErrors.badRequest("El email ya está registrado");
    }
    
    const existingUserByUsername = await prismaClient.user.findUnique({
      where: { username: user.username }
    });
    
    if (existingUserByUsername) {
      throw HttpCustomErrors.badRequest("El username ya está en uso");
    }

    //* Hash de contraseña
    const hashedPassword = await bcrypt.hash(password);
    
    //* Crear usuario
    const newUser = await prismaClient.user.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
    });
    
    return UserEntity.mapFromPrisma(newUser);
  }



  async updateUser(user: UpdateUserDto): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }


  async deleteUser(id: string | number): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }


  
 
}