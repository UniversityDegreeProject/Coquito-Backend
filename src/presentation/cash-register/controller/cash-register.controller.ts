import { Request, Response } from "express";
import {
  HttpCustomErrors,
  CashRegisterRepository,
  OpenCashRegisterDto,
  CloseCashRegisterDto,
  GetCurrentCashRegisterDto,
  GetCashRegisterHistoryDto,
  OpenCashRegisterUseCaseImpl,
  CloseCashRegisterUseCaseImpl,
  GetCurrentCashRegisterUseCaseImpl,
} from "../../../domain";
import { GetCashRegisterHistoryUseCaseImpl } from "../../../domain/use-cases/cash-register/get-cash-register-history.uc";
import { ActivityLogger } from "../../../domain/services/activity-logger.service";
import { SocketService } from "../../socket/socket.service";

export class CashRegisterController {
  constructor(
    private readonly cashRegisterRepository: CashRegisterRepository,
  ) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  /**
   * POST /api/cash-register/open
   * Abre una nueva caja para el usuario actual
   */
  openCashRegister = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, openCashRegisterDto] = OpenCashRegisterDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!openCashRegisterDto)
      return res.status(400).json({ error: "Datos incorrectos" });

    new OpenCashRegisterUseCaseImpl(this.cashRegisterRepository)
      .execute(openCashRegisterDto)
      .then(async (cashRegister) => {
        // Registrar actividad
        const userId = (req as any).user?.id;
        if (userId) {
          await ActivityLogger.log({
            userId,
            action: "OPEN_CASH_REGISTER",
            entity: "CashRegister",
            entityId: cashRegister.id,
            description: `Abrió caja con monto inicial: Bs.${cashRegister.openingAmount}`,
            metadata: {
              openingAmount: cashRegister.openingAmount,
            },
            ipAddress: req.ip,
            userAgent: req.headers?.["user-agent"],
          });
        }

        SocketService.emit("cash-register:opened", { cashRegister });

        return res.status(201).json({
          message: "Caja abierta exitosamente",
          cashRegister,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * POST /api/cash-register/close
   * Cierra la caja actual del usuario
   */
  closeCashRegister = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, closeCashRegisterDto] = CloseCashRegisterDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!closeCashRegisterDto)
      return res.status(400).json({ error: "Datos incorrectos" });

    new CloseCashRegisterUseCaseImpl(this.cashRegisterRepository)
      .execute(closeCashRegisterDto)
      .then(async (cashRegister) => {
        // Registrar actividad
        const userId = (req as any).user?.id;
        if (userId) {
          await ActivityLogger.log({
            userId,
            action: "CLOSE_CASH_REGISTER",
            entity: "CashRegister",
            entityId: cashRegister.id,
            description: `Cerró caja - Esperado: Bs.${cashRegister.expectedAmount}, Real: Bs.${cashRegister.closingAmount}, Diferencia: Bs.${cashRegister.difference}`,
            metadata: {
              openingAmount: cashRegister.openingAmount,
              closingAmount: cashRegister.closingAmount,
              expectedAmount: cashRegister.expectedAmount,
              difference: cashRegister.difference,
              totalSales: cashRegister.totalSales,
            },
            ipAddress: req.ip,
            userAgent: req.headers?.["user-agent"],
          });
        }

        SocketService.emit("cash-register:closed", { cashRegister });

        return res.status(200).json({
          message: "Caja cerrada exitosamente",
          cashRegister,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/cash-register/current/:userId
   * Obtiene la caja actualmente abierta del usuario
   */
  getCurrentCashRegister = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const [error, getCurrentCashRegisterDto] = GetCurrentCashRegisterDto.create(
      {
        userId,
      },
    );
    if (error) return res.status(400).json({ error: error });
    if (!getCurrentCashRegisterDto)
      return res.status(400).json({ error: "ID de usuario inválido" });

    new GetCurrentCashRegisterUseCaseImpl(this.cashRegisterRepository)
      .execute(getCurrentCashRegisterDto)
      .then((cashRegister) => {
        if (!cashRegister) {
          return res.status(200).json({
            message: "El usuario no tiene una caja abierta",
            cashRegister: null,
          });
        }
        return res.status(200).json({ cashRegister });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/cash-register/history
   * Obtiene el historial de cierres de caja con paginación
   * Query params: userId (opcional), startDate (opcional), endDate (opcional), page, limit
   */
  getCashRegisterHistory = async (req: Request, res: Response) => {
    const query = req.query;

    //? Parsear números
    const parsedQuery = {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    };

    const [error, getCashRegisterHistoryDto] =
      GetCashRegisterHistoryDto.create(parsedQuery);
    if (error) return res.status(400).json({ error: error });
    if (!getCashRegisterHistoryDto)
      return res
        .status(400)
        .json({ error: "Parámetros de búsqueda incorrectos" });

    new GetCashRegisterHistoryUseCaseImpl(this.cashRegisterRepository)
      .execute(getCashRegisterHistoryDto)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}
