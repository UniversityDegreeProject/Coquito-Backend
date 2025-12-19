import { Request, Response } from "express";
import {
  HttpCustomErrors,
  SystemConfigRepository,
  UpdateSystemConfigDto,
  GetSystemConfigUseCaseImpl,
  UpdateSystemConfigUseCaseImpl,
} from "../../../domain";

export class SystemConfigController {
  constructor(
    private readonly systemConfigRepository: SystemConfigRepository
  ) {}

  // * Maneja los errores personalizados y genéricos de HTTP
  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  // * Obtiene todas las configuraciones del sistema
  getSystemConfig = async (_req: Request, res: Response) => {
    new GetSystemConfigUseCaseImpl(this.systemConfigRepository)
      .execute()
      .then((configs) => {
        return res.status(200).json({ configs });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  // * Actualiza o crea múltiples configuraciones del sistema
  updateSystemConfig = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, updateSystemConfigDto] = UpdateSystemConfigDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!updateSystemConfigDto) {
      return res
        .status(400)
        .json({ error: "Datos de configuración inválidos" });
    }

    new UpdateSystemConfigUseCaseImpl(this.systemConfigRepository)
      .execute(updateSystemConfigDto)
      .then((configs) => {
        return res.status(200).json({
          message: "Configuración del sistema actualizada exitosamente",
          configs,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}
