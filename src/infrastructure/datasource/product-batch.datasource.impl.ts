import { prismaClient } from "../../data/postgres";
import {
  ProductBatchDatasource,
  ProductBatchEntity,
  CreateProductBatchDto,
  GetBatchesByProductDto,
  UpdateBatchStockDto,
  DeleteBatchDto,
  HttpCustomErrors,
} from "../../domain";

export class ProductBatchDatasourceImpl implements ProductBatchDatasource {
  
  /**
   * Genera un código único para el batch
   * Formato: SKU-PESO-TIMESTAMP
   * Ejemplo: "PEC-POL-450G-123"
   */
  private generateBatchCode(productSku: string, weightInKg: number): string {
    const weightInGrams = Math.round(weightInKg * 1000);
    const timestamp = Date.now().toString().slice(-3);
    return `${productSku}-${weightInGrams}G-${timestamp}`;
  }

  // * Crear batch
  async createBatch(createBatchDto: CreateProductBatchDto): Promise<ProductBatchEntity> {
    const { productId, weight, unitPrice } = createBatchDto;

    //? Usar transacción para asegurar consistencia
    const result = await prismaClient.$transaction(async (prisma) => {
      //? Verificar que el producto existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw HttpCustomErrors.notFound("Producto no encontrado");
      }

      //? Verificar que el producto ES de peso variable
      if (!product.isVariableWeight) {
        throw HttpCustomErrors.badRequest(
          "Este producto no es de peso variable. Use el stock normal."
        );
      }

      //? Buscar si ya existe un batch con el mismo peso y precio
      const existingBatch = await prisma.productBatch.findFirst({
        where: {
          productId,
          weight,
          unitPrice,
        },
      });

      //? Si ya existe, incrementar su stock en lugar de crear uno nuevo
      if (existingBatch) {
        const updatedBatch = await prisma.productBatch.update({
          where: { id: existingBatch.id },
          data: { stock: { increment: 1 } },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        });

        //? Incrementar el stock total del producto
        await prisma.product.update({
          where: { id: productId },
          data: { stock: { increment: 1 } },
        });

        //? Recalcular precio total del producto
        await this.recalculateProductPrice(prisma, productId);

        return ProductBatchEntity.mapFromPrisma(updatedBatch);
      }

      //? Si NO existe, generar código único y crear nuevo batch
      const batchCode = this.generateBatchCode(product.sku || "PRD", weight);

      //? Crear el batch
      const newBatch = await prisma.productBatch.create({
        data: {
          productId,
          batchCode,
          weight,
          unitPrice,
          stock: 1, // Siempre empieza en 1 unidad
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      //? Incrementar el stock total del producto
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: 1 } },
      });

      //? Recalcular precio total del producto (suma de unitPrice de todos los batches)
      await this.recalculateProductPrice(prisma, productId);

      return newBatch;
    });

    return ProductBatchEntity.mapFromPrisma(result);
  }

  // * Obtener batches por producto
  async getBatchesByProduct(dto: GetBatchesByProductDto): Promise<ProductBatchEntity[]> {
    const { productId } = dto;

    //? Verificar que el producto existe
    const product = await prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw HttpCustomErrors.notFound("Producto no encontrado");
    }

    //? Obtener batches del producto (solo con stock disponible)
    const batches = await prismaClient.productBatch.findMany({
      where: {
        productId,
        stock: { gt: 0 }, // Solo batches con stock disponible
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return batches.map((batch) => ProductBatchEntity.mapFromPrisma(batch));
  }

  // * Actualizar stock de un batch
  async updateBatchStock(dto: UpdateBatchStockDto): Promise<ProductBatchEntity> {
    const { batchId, stock, userId, reason, notes } = dto;

    //? Usar transacción para mantener consistencia
    const result = await prismaClient.$transaction(async (prisma) => {
      //? Obtener el batch actual
      const currentBatch = await prisma.productBatch.findUnique({
        where: { id: batchId },
      });

      if (!currentBatch) {
        throw HttpCustomErrors.notFound("Batch no encontrado");
      }

      //? Calcular la diferencia de stock
      const stockDifference = stock - currentBatch.stock;

      //? Actualizar el batch
      const updatedBatch = await prisma.productBatch.update({
        where: { id: batchId },
        data: { stock },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      //? Recalcular stock total del producto sumando todos los batches
      const allBatches = await prisma.productBatch.findMany({
        where: { productId: currentBatch.productId },
      });
      const totalStock = allBatches.reduce((sum, b) => sum + b.stock, 0);

      //? Actualizar el stock total del producto
      await prisma.product.update({
        where: { id: currentBatch.productId },
        data: {
          stock: totalStock,
        },
      });

      //? Recalcular precio total del producto
      await this.recalculateProductPrice(prisma, currentBatch.productId);

      //? Obtener el producto actualizado para el stock movement
      const updatedProduct = await prisma.product.findUnique({
        where: { id: currentBatch.productId },
      });

      //? Registrar en StockMovements para auditoría
      if (stockDifference !== 0 && updatedProduct) {
        await prisma.stockMovement.create({
          data: {
            productId: currentBatch.productId,
            userId: userId,
            type: stockDifference > 0 ? "Reabastecimiento" : "Ajuste",
            quantity: Math.abs(stockDifference),
            previousStock: updatedProduct.stock - stockDifference,
            newStock: updatedProduct.stock,
            reason: reason || "Reasignación de batch",
            reference: updatedBatch.batchCode,
            notes: notes || `Batch: ${updatedBatch.batchCode} (${updatedBatch.weight}kg - Bs ${updatedBatch.unitPrice})`,
          },
        });
      }

      return updatedBatch;
    });

    return ProductBatchEntity.mapFromPrisma(result);
  }

  // * Eliminar batch
  async deleteBatch(dto: DeleteBatchDto): Promise<ProductBatchEntity> {
    const { batchId } = dto;

    //? Usar transacción
    const result = await prismaClient.$transaction(async (prisma) => {
      //? Obtener el batch
      const batch = await prisma.productBatch.findUnique({
        where: { id: batchId },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!batch) {
        throw HttpCustomErrors.notFound("Batch no encontrado");
      }

      //? Verificar que el batch no tenga stock (opcional, puedes eliminarlo aunque tenga)
      if (batch.stock > 0) {
        throw HttpCustomErrors.badRequest(
          `No se puede eliminar el batch porque aún tiene ${batch.stock} unidad(es) en stock`
        );
      }

      //? Eliminar el batch
      const deletedBatch = await prisma.productBatch.delete({
        where: { id: batchId },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      //? Decrementar el stock del producto (si el batch tenía stock)
      if (batch.stock > 0) {
        await prisma.product.update({
          where: { id: batch.productId },
          data: {
            stock: { decrement: batch.stock },
          },
        });
      }

      //? Recalcular precio total del producto
      await this.recalculateProductPrice(prisma, batch.productId);

      return deletedBatch;
    });

    return ProductBatchEntity.mapFromPrisma(result);
  }

  // * Método auxiliar para recalcular el precio total del producto
  private async recalculateProductPrice( prisma: any,  productId: string ): Promise<void> {
    //? Obtener todos los batches del producto
    const batches = await prisma.productBatch.findMany({
      where: { productId },
    });

    //? Calcular precio total (suma de unitPrice × stock de cada batch)
    const totalPrice = batches.reduce( (sum: number, batch: any) => sum + (Number(batch.unitPrice) * batch.stock),
      0
    );

    //? Actualizar el precio del producto
    await prisma.product.update({
      where: { id: productId },
      data: { price: totalPrice },
    });
  }
}

