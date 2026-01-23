import { Request, Response } from "express";
import {
  HttpCustomErrors,
  ReportRepository,
  GetDailyReportDto,
  GetSalesReportDto,
  GetProductsReportDto,
  GetCustomersReportDto,
  GetCashRegisterSummaryDto,
  GetSellersReportDto,
  GetDailyReportUseCaseImpl,
  GetSalesReportUseCaseImpl,
  GetProductsReportUseCaseImpl,
  GetCustomersReportUseCaseImpl,
  GetCashRegisterSummaryUseCaseImpl,
  GetSellersReportUseCaseImpl,
} from "../../../domain";

export class ReportController {
  constructor(private readonly reportRepository: ReportRepository) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Internal server error" });
  };

  /**
   * GET /api/reports/daily
   * Obtiene el reporte diario para una fecha específica
   */
  getDailyReport = async (req: Request, res: Response) => {
    const query = req.query;

    const [error, getDailyReportDto] = GetDailyReportDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!getDailyReportDto)
      return res.status(400).json({ error: "Parámetros incorrectos" });

    new GetDailyReportUseCaseImpl(this.reportRepository)
      .execute(getDailyReportDto)
      .then((report) => {
        return res.status(200).json({ report });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/reports/sales
   * Obtiene el reporte de ventas en un rango de fechas
   */
  getSalesReport = async (req: Request, res: Response) => {
    const query = req.query;

    const [error, getSalesReportDto] = GetSalesReportDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!getSalesReportDto)
      return res.status(400).json({ error: "Parámetros incorrectos" });

    new GetSalesReportUseCaseImpl(this.reportRepository)
      .execute(getSalesReportDto)
      .then((report) => {
        return res.status(200).json({ report });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/reports/products
   * Obtiene el reporte de productos más vendidos
   */
  getProductsReport = async (req: Request, res: Response) => {
    const query = req.query;

    const [error, getProductsReportDto] = GetProductsReportDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!getProductsReportDto)
      return res.status(400).json({ error: "Parámetros incorrectos" });

    new GetProductsReportUseCaseImpl(this.reportRepository)
      .execute(getProductsReportDto)
      .then((report) => {
        return res.status(200).json({ report });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/reports/customers
   * Obtiene el reporte de mejores clientes
   */
  getCustomersReport = async (req: Request, res: Response) => {
    const query = req.query;

    const [error, getCustomersReportDto] = GetCustomersReportDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!getCustomersReportDto)
      return res.status(400).json({ error: "Parámetros incorrectos" });

    new GetCustomersReportUseCaseImpl(this.reportRepository)
      .execute(getCustomersReportDto)
      .then((report) => {
        return res.status(200).json({ report });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/reports/cash-register-summary
   * Obtiene el resumen de cierres de caja en un rango de fechas
   */
  getCashRegisterSummary = async (req: Request, res: Response) => {
    const query = req.query;

    const [error, getCashRegisterSummaryDto] =
      GetCashRegisterSummaryDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!getCashRegisterSummaryDto)
      return res.status(400).json({ error: "Parámetros incorrectos" });

    new GetCashRegisterSummaryUseCaseImpl(this.reportRepository)
      .execute(getCashRegisterSummaryDto)
      .then((report) => {
        return res.status(200).json({ report });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  /**
   * GET /api/reports/sellers
   * Obtiene el reporte de ventas por vendedor
   */
  getSellersReport = async (req: Request, res: Response) => {
    const query = req.query;

    const [error, getSellersReportDto] = GetSellersReportDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!getSellersReportDto)
      return res.status(400).json({ error: "Parámetros incorrectos" });

    new GetSellersReportUseCaseImpl(this.reportRepository)
      .execute(getSellersReportDto)
      .then((report) => {
        return res.status(200).json({ report });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}
