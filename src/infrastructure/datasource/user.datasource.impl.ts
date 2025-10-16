import { prismaClient } from "../../data/postgres";
import { DeleteUserByIdDto, GetUserByEmailDto, GetUserByIdDto, RegisterUserDto, UpdateUserDto, UserDatasource, UserEntity } from "../../domain";
import { SearchUsersDto } from "../../domain/dto/user/search-users.dto";
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
  async getUserById(id: GetUserByIdDto): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { id: id.id },
    });

    if (!user) throw HttpCustomErrors.notFound("User not found");
    
    return UserEntity.mapFromPrisma(user);
  }


  // * Obtener usuario por email
  async getUserByEmail(email: GetUserByEmailDto): Promise<UserEntity> {
    const user = await prismaClient.user.findUnique({
      where: { email: email.email },
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
    const hashedPassword = await this.bcrypt.hash(password!);
    
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
    const { id, email, username } = user;
    
    //? Verificar que el usuario existe
    const userToUpdate = await prismaClient.user.findUnique({
      where: { id },
    });
    if (!userToUpdate) throw HttpCustomErrors.notFound("Usuario no encontrado");
    
    //? Validar que el email no esté en uso por OTRO usuario
    if (email) {
      const existingUserByEmail = await prismaClient.user.findUnique({
        where: { email },
      });
      
      //? Solo lanzar error si el email pertenece a OTRO usuario (no al usuario actual)
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw HttpCustomErrors.badRequest("El correo electrónico esta siendo usado por otro usuario");
      }
    }
    
    //? Validar que el username no esté en uso por OTRO usuario
    if (username) {
      const existingUserByUsername = await prismaClient.user.findUnique({
        where: { username },
      });
      
      //? Solo lanzar error si el username pertenece a OTRO usuario (no al usuario actual)
      if (existingUserByUsername && existingUserByUsername.id !== id) {
        throw HttpCustomErrors.badRequest("El nombre de usuario ya esta siendo usado");
      }
    }
    
    //? Preparar datos de actualización
    const updateData = user.values;
    
    //? Si se actualiza la contraseña, hashearla
    if (updateData.password) {
      updateData.password = await this.bcrypt.hash(updateData.password);
    }
    
    //? Actualizar usuario
    const updatedUser = await prismaClient.user.update({
      where: { id },
      data: updateData,
    });
    
    return UserEntity.mapFromPrisma(updatedUser);
  }


  // * Eliminar usuario
  async deleteUser(id: DeleteUserByIdDto): Promise<UserEntity> {

    const userToDelete = await prismaClient.user.findUnique({
      where: { id: id.id },
    });

    if (!userToDelete) throw HttpCustomErrors.notFound("Usuario no encontrado");

    const user = await prismaClient.user.delete({
      where: { id: id.id },
    });

    return UserEntity.mapFromPrisma(user);
  }


  // * Buscar usuarios con filtros
  async searchUsers(searchUsersDto: SearchUsersDto): Promise<{
    users: UserEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, role, status, page, limit } = searchUsersDto;

    //? Construir el objeto where para Prisma
    const where: any = {};

    //? Búsqueda general (username, email, firstName, lastName)
    if (search && search.trim() !== "") {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }


    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }


    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prismaClient.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc', 
        },
      }),
      prismaClient.user.count({ where }), 
    ]);

    // Calcular total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => UserEntity.mapFromPrisma(user)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}