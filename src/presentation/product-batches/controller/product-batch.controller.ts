import { Request, Response } from "express";
import {
  HttpCustomErrors,
  ProductBatchRepository,
  CreateProductBatchDto,
  GetBatchesByProductDto,
  UpdateBatchStockDto,
  DeleteBatchDto,
  CreateProductBatchUseCaseImpl,
  GetBatchesByProductUseCaseImpl,
  UpdateBatchStockUseCaseImpl,
  DeleteBatchUseCaseImpl,
} from "../../../domain";

export class ProductBatchController {
  constructor(private readonly productBatchRepository: ProductBatchRepository) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  // * Crear batch
  createBatch = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const body = req.body;

    const [error, createBatchDto] = CreateProductBatchDto.create({
      productId,
      ...body,
    });
    if (error) return res.status(400).json({ error: error });
    if (!createBatchDto) return res.status(400).json({ error: "Datos incorrectos" });

    new CreateProductBatchUseCaseImpl(this.productBatchRepository)
      .execute(createBatchDto)
      .then((batch) => {
        return res.status(201).json({
          message: "Batch creado exitosamente",
          batch,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  // * Obtener batches por producto
  getBatchesByProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;

    const [error, getBatchesDto] = GetBatchesByProductDto.create({ productId });
    if (error) return res.status(400).json({ error: error });
    if (!getBatchesDto)
      return res.status(400).json({ error: "ID de producto inválido" });

    new GetBatchesByProductUseCaseImpl(this.productBatchRepository)
      .execute(getBatchesDto)
      .then((batches) => {
        return res.status(200).json({ 
          message: "Batches obtenidos exitosamente",
          batches 
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  // * Actualizar stock de batch
  updateBatchStock = async (req: Request, res: Response) => {
    const { batchId } = req.params;
    const { stock, userId, reason, notes } = req.body;

    const [error, updateStockDto] = UpdateBatchStockDto.create({ 
      batchId, 
      stock, 
      userId,
      reason,
      notes 
    });
    if (error) return res.status(400).json({ error: error });
    if (!updateStockDto) return res.status(400).json({ error: "Datos incorrectos" });

    new UpdateBatchStockUseCaseImpl(this.productBatchRepository)
      .execute(updateStockDto)
      .then((batch) => {
        return res.status(200).json({
          message: "Stock de batch actualizado exitosamente",
          batch,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  // * Eliminar batch
  deleteBatch = async (req: Request, res: Response) => {
    const { batchId } = req.params;

    const [error, deleteBatchDto] = DeleteBatchDto.create({ batchId });
    if (error) return res.status(400).json({ error: error });
    if (!deleteBatchDto) return res.status(400).json({ error: "ID de batch inválido" });

    new DeleteBatchUseCaseImpl(this.productBatchRepository)
      .execute(deleteBatchDto)
      .then((batch) => {
        return res.status(200).json({
          message: "Batch eliminado exitosamente",
          batch,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}

