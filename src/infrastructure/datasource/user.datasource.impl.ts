import { prismaClient } from "../../data/postgres";
import {
  DeleteUserByIdDto,
  GetUserByEmailDto,
  GetUserByIdDto,
  GetUserOptionalFiltersDto,
  PaginateResponse,
  RegisterUserDto,
  UpdateUserDto,
  UserDatasource,
  UserEntity,
} from "../../domain";
import { HttpCustomErrors } from "../../domain/errors/http-custom-errors";

export class UserDatasourceImpl implements UserDatasource {
  constructor() {}

  private generateUrl(
    search: string | undefined,
    role: string | undefined,
    status: string | undefined,
    page: number,
    limit: number
  ): string {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (role) params.append("role", role);
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return `/users?${params.toString()}`;
  }

  // * Obtener usuarios
  async getUsers(
    getUserOptionalFiltersDto: GetUserOptionalFiltersDto
  ): Promise<PaginateResponse<UserEntity>> {
    const { page, limit, search, role, status } = getUserOptionalFiltersDto;

    const where: any = {};

    if (search && search.trim() !== "") {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prismaClient.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "asc" }, // Ordenar por fecha de mas antiguo a mas nuevo
      }),
      prismaClient.user.count({ where }),
    ]);
    return {
      data: users.map((user) => UserEntity.mapFromPrisma(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      nextPage:
        page < Math.ceil(total / limit)
          ? this.generateUrl(search, role, status, page + 1, limit)
          : null,
      previousPage:
        page > 1
          ? this.generateUrl(search, role, status, page - 1, limit)
          : null,
    };
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
    const { email, username, password, ...rest } = user;

    const existingUserByEmail = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw HttpCustomErrors.badRequest("El email ya está registrado");
    }

    const existingUserByUsername = await prismaClient.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      throw HttpCustomErrors.badRequest("El username ya está en uso");
    }

    //? Crear usuario
    const newUser = await prismaClient.user.create({
      data: {
        ...rest,
        password: password!,
        username,
        email,
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
        throw HttpCustomErrors.badRequest(
          "El correo electronico ya esta siendo usado por otra persona"
        );
      }
    }

    //? Validar que el username no esté en uso por OTRO usuario
    if (username) {
      const existingUserByUsername = await prismaClient.user.findUnique({
        where: { username },
      });

      //? Solo lanzar error si el username pertenece a OTRO usuario (no al usuario actual)
      if (existingUserByUsername && existingUserByUsername.id !== id) {
        throw HttpCustomErrors.badRequest(
          "El nombre de usuario ya esta siendo usado por otra persona"
        );
      }
    }

    //? Preparar datos de actualización
    const updateData = user.values;

    //? Actualizar usuario
    const updatedUser = await prismaClient.user.update({
      where: { id },
      data: updateData,
    });

    return UserEntity.mapFromPrisma(updatedUser);
  }

  // * Eliminar usuario
  async deleteUser(id: DeleteUserByIdDto): Promise<UserEntity> {
    const { id: idToDelete } = id;

    const userToDelete = await prismaClient.user.findUnique({
      where: { id: idToDelete },
      include: {
        sales: true,
        cashRegisters: true,
        stockMovements: true,
        activityLogs: true,
      },
    });

    if (!userToDelete) throw HttpCustomErrors.notFound("Usuario no encontrado");

    if (userToDelete.sales.length > 0) {
      throw HttpCustomErrors.badRequest(
        "No se puede eliminar el usuario porque tiene ventas asociadas"
      );
    }

    if (userToDelete.cashRegisters.length > 0) {
      throw HttpCustomErrors.badRequest(
        "No se puede eliminar el usuario porque tiene control de caja asociadas"
      );
    }

    if (userToDelete.stockMovements.length > 0) {
      throw HttpCustomErrors.badRequest(
        "No se puede eliminar el usuario porque tiene movimientos de inventario asociados"
      );
    }

    const user = await prismaClient.user.delete({
      where: { id: idToDelete },
    });

    return UserEntity.mapFromPrisma(user);
  }

  // * Guardar refresh token en la base de datos
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await prismaClient.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // * Obtener usuario por refresh token
  async getUserByRefreshToken(refreshToken: string): Promise<UserEntity> {
    const user = await prismaClient.user.findFirst({
      where: { refreshToken },
    });

    if (!user)
      throw HttpCustomErrors.unauthorized("Refresh token inválido o expirado");

    return UserEntity.mapFromPrisma(user);
  }

  // * Eliminar refresh token (logout)
  async removeRefreshToken(userId: string): Promise<void> {
    await prismaClient.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
