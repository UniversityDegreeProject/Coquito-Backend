import { CashRegisterEntity } from "../entities/cash-register.entity";
import { OpenCashRegisterDto } from "../dto/cash-register/open-cash-register.dto";
import { CloseCashRegisterDto } from "../dto/cash-register/close-cash-register.dto";
import { GetCurrentCashRegisterDto } from "../dto/cash-register/get-current-cash-register.dto";
import { GetCashRegisterHistoryDto } from "../dto/cash-register/get-cash-register-history.dto";
import { PaginateResponse } from "../interfaces/shared/paginated-response.interface";

/**
 * Datasource abstracto para Cash Register
 * Define las operaciones que debe implementar cualquier datasource de caja
 */
export abstract class CashRegisterDatasource {
  /**
   * Abre una nueva caja para un usuario
   * Valida que el usuario NO tenga ya una caja abierta
   */
  abstract openCashRegister(dto: OpenCashRegisterDto): Promise<CashRegisterEntity>;

  /**
   * Cierra una caja existente
   * Calcula la diferencia entre el monto esperado y el monto real
   */
  abstract closeCashRegister(dto: CloseCashRegisterDto): Promise<CashRegisterEntity>;

  /**
   * Obtiene la caja actualmente abierta de un usuario
   * Retorna null si no tiene caja abierta
   */
  abstract getCurrentCashRegister(dto: GetCurrentCashRegisterDto): Promise<CashRegisterEntity | null>;

  /**
   * Obtiene una caja por su ID
   */
  abstract getCashRegisterById(cashRegisterId: string): Promise<CashRegisterEntity>;

  /**
   * Actualiza los totales de una caja cuando se registra una venta
   * Se usa internamente cuando se crea una Order
   */
  abstract updateCashRegisterTotals(
    cashRegisterId: string,
    orderTotal: number,
    paymentMethod: "Efectivo" | "Tarjeta" | "QR"
  ): Promise<void>;

  /**
   * Obtiene el historial de cierres de caja con paginación
   * Filtra por usuario y rango de fechas opcionales
   */
  abstract getCashRegisterHistory(dto: GetCashRegisterHistoryDto): Promise<PaginateResponse<CashRegisterEntity>>;
}

