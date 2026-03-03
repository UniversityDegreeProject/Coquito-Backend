import { Request, Response } from "express";
import {
  HttpCustomErrors,
  ProductRepository,
  CreateProductDto,
  UpdateProductDto,
  GetProductByIdDto,
  DeleteProductByIdDto,
  CreateProductUseCaseImpl,
  UpdateProductUseCaseImpl,
  DeleteProductUseCaseImpl,
  GetProductByIdUseCaseImpl,
  GetProductOptionalFiltersDto,
  GetProductOptionalFiltersUseCaseImpl,
} from "../../../domain";
import { ActivityLogger } from "../../../domain/services/activity-logger.service";
import { SocketService } from "../../socket/socket.service";

export class ProductController {
  constructor(private readonly productRepository: ProductRepository) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  getProducts = async (req: Request, res: Response) => {
    const [error, getProductOptionalFiltersDto] =
      GetProductOptionalFiltersDto.create(req.query);
    if (error) return res.status(400).json({ error: error });
    if (!getProductOptionalFiltersDto)
      return res
        .status(400)
        .json({ error: "Parámetros de búsqueda inválidos" });

    new GetProductOptionalFiltersUseCaseImpl(this.productRepository)
      .execute(getProductOptionalFiltersDto)
      .then(({ data, ...rest }) => {
        return res.status(200).json({
          data,
          ...rest,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, getProductByIdDto] = GetProductByIdDto.create({ id });
    if (error) return res.status(400).json({ error: error });
    if (!getProductByIdDto)
      return res.status(400).json({ error: "Producto no encontrado" });

    new GetProductByIdUseCaseImpl(this.productRepository)
      .execute(getProductByIdDto)
      .then((product) => {
        if (!product)
          return res.status(404).json({ error: "Producto no encontrado" });
        return res.status(200).json({ product });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  createProduct = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createProductDto] = CreateProductDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!createProductDto)
      return res.status(400).json({ error: "Datos incorrectos" });

    new CreateProductUseCaseImpl(this.productRepository)
      .execute(createProductDto)
      .then(async (product) => {
        // Registrar actividad
        const userId = (req as any).user?.id;
        if (userId) {
          await ActivityLogger.logCreate(
            userId,
            "Product",
            product.id,
            product.name,
            req,
          );
        }

        SocketService.emit("product:created", { product });

        return res.status(201).json({
          message: "Producto creado exitosamente",
          product,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;

    const [error, updateProductDto] = UpdateProductDto.create({ id, ...body });
    if (error) return res.status(400).json({ error: error });
    if (!updateProductDto)
      return res.status(400).json({ error: "Producto no encontrado" });

    new UpdateProductUseCaseImpl(this.productRepository)
      .execute(updateProductDto)
      .then(async (product) => {
        if (!product)
          return res.status(404).json({ error: "Producto no encontrado" });

        // Registrar actividad
        const userId = (req as any).user?.id;
        if (userId) {
          await ActivityLogger.logUpdate(
            userId,
            "Product",
            product.id,
            product.name,
            { ...body },
            req,
          );
        }

        SocketService.emit("product:updated", { product });

        return res.status(200).json({
          message: "Producto actualizado exitosamente",
          product,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, deleteProductDto] = DeleteProductByIdDto.create({ id: id });
    if (error) return res.status(400).json({ error: error });
    if (!deleteProductDto)
      return res.status(400).json({ error: "Id de producto no encontrado" });

    new DeleteProductUseCaseImpl(this.productRepository)
      .execute(deleteProductDto)
      .then(async (product) => {
        if (!product)
          return res.status(404).json({ error: "Producto no encontrado" });

        // Registrar actividad
        const userId = (req as any).user?.id;
        if (userId) {
          await ActivityLogger.logDelete(
            userId,
            "Product",
            product.id,
            product.name,
            req,
          );
        }

        SocketService.emit("product:deleted", { product });

        return res.status(200).json({
          message: "Producto eliminado exitosamente",
          product,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}
