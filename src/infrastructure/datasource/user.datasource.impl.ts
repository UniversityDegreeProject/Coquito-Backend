import { prismaClient } from "../../data/postgres";
import { RegisterUserDto, UpdateUserDto, UserDatasource, UserEntity } from "../../domain";
import { HttpCustomErrors } from "../../domain/errors/http-custom-errors";
import { BcryptAdapter } from "../../config";


export class UserDatasourceImpl implements UserDatasource {


  constructor(
    private readonly bcrypt: BcryptAdapter
  ) {
  }


  // * Obtener usuarios
  async getUsers(): Promise<UserEntity[]> {
    const users = await prismaClient.user.findMany();
    return users.map(user => UserEntity.mapFromPrisma(user));
  }

  // * Obtener usuario por username
  async getUserByUsername(username: string): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { username },
    });
    
    if (!user) throw HttpCustomErrors.notFound("User not found");
    
    return UserEntity.mapFromPrisma(user);
  }

  // * Obtener usuario por id
  async getUserById(id: string | number): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { id: id.toString() },
    });

    if (!user) throw HttpCustomErrors.notFound("User not found");
    
    return UserEntity.mapFromPrisma(user);
  }


  // * Obtener usuario por email
  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { email },
    });
    
    if (!user) throw HttpCustomErrors.notFound("Usuario no encontrado");
    
    return UserEntity.mapFromPrisma(user);
  }


  // * Crear usuario
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

    //? Hash de contraseña
    const hashedPassword = await this.bcrypt.hash(password);
    
    //? Crear usuario
    const newUser = await prismaClient.user.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
    });
    
    return UserEntity.mapFromPrisma(newUser);
  }


  // * Actualizar usuario
  async updateUser(user: UpdateUserDto): Promise<UserEntity> {
    const { id } = user;
    
    const userToUpdate = await prismaClient.user.findUnique({
      where: { id },
    });
    
    if (!userToUpdate) throw HttpCustomErrors.notFound("Usuario no encontrado");
    
    const updateData = user.values;
    if (updateData.password) {
      updateData.password = await this.bcrypt.hash(updateData.password);
    }
    
    const updatedUser = await prismaClient.user.update({
      where: { id },
      data: updateData,
    });
    
    return UserEntity.mapFromPrisma(updatedUser);
  }


  // * Eliminar usuario
  async deleteUser(id: string | number): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }


  
 
}