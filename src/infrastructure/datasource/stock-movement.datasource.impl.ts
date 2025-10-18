import { prismaClient } from "../../data/postgres";
import {
  StockMovementDatasource,
  StockMovementEntity,
  CreateStockMovementDto,
  GetStockMovementByIdDto,
  SearchStockMovementsDto,
  GetStockMovementsByProductDto,
  HttpCustomErrors,
} from "../../domain";

export class StockMovementDatasourceImpl implements StockMovementDatasource {
  
  // * Crear movimiento de stock
  async createStockMovement(stockMovement: CreateStockMovementDto): Promise<StockMovementEntity> {
    const { productId, userId, type, quantity, reason, reference, notes } = stockMovement;

    //? Usar transacción para asegurar consistencia
    const result = await prismaClient.$transaction(async (prisma) => {
      //? Verificar que el producto existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw HttpCustomErrors.notFound("Producto no encontrado");
      }

      //? Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw HttpCustomErrors.notFound("Usuario no encontrado");
      }

      //? Calcular el nuevo stock
      const previousStock = product.stock;
      const newStock = previousStock + quantity;

      //? Validar que el nuevo stock no sea negativo
      if (newStock < 0) {
        throw HttpCustomErrors.badRequest(
          `No se puede realizar el movimiento. Stock insuficiente. Stock actual: ${previousStock}, Cantidad solicitada: ${Math.abs(quantity)}`
        );
      }

      //? Crear el movimiento de stock
      const newMovement = await prisma.stockMovement.create({
        data: {
          productId,
          userId,
          type,
          quantity,
          previousStock,
          newStock,
          reason: reason ?? null,
          reference: reference ?? null,
          notes: notes ?? null,
        },
        include: {
          user: true,
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      //? Actualizar el stock del producto
      await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      return newMovement;
    });

    return StockMovementEntity.mapFromPrisma(result);
  }

  // * Obtener movimiento de stock por ID
  async getStockMovementById(id: GetStockMovementByIdDto): Promise<StockMovementEntity> {
    const movement = await prismaClient.stockMovement.findUnique({
      where: { id: id.id },
      include: {
        user: true,
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!movement) throw HttpCustomErrors.notFound("Movimiento de stock no encontrado");

    return StockMovementEntity.mapFromPrisma(movement);
  }

  // * Buscar movimientos de stock con filtros
  async searchStockMovements(searchDto: SearchStockMovementsDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { productId, userId, type, startDate, endDate, page, limit } = searchDto;

    //? Construir el objeto where para Prisma
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    //? Filtro de fechas
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    //? Paginación
    const skip = (page - 1) * limit;

    //? Ejecutar consulta con paginación
    const [movements, total] = await Promise.all([
      prismaClient.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prismaClient.stockMovement.count({ where }),
    ]);

    //? Calcular total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      movements: movements.map((movement) => StockMovementEntity.mapFromPrisma(movement)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  // * Obtener movimientos de stock por producto
  async getStockMovementsByProduct(dto: GetStockMovementsByProductDto): Promise<{
    movements: StockMovementEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { productId, page, limit } = dto;

    //? Verificar que el producto existe
    const product = await prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw HttpCustomErrors.notFound("Producto no encontrado");
    }

    //? Paginación
    const skip = (page - 1) * limit;

    //? Obtener movimientos del producto
    const [movements, total] = await Promise.all([
      prismaClient.stockMovement.findMany({
        where: { productId },
        skip,
        take: limit,
        include: {
          user: true,
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prismaClient.stockMovement.count({ where: { productId } }),
    ]);

    //? Calcular total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      movements: movements.map((movement) => StockMovementEntity.mapFromPrisma(movement)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

