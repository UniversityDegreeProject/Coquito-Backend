import { CashRegisterEntity } from "../entities/cash-register.entity";
import { OpenCashRegisterDto } from "../dto/cash-register/open-cash-register.dto";
import { CloseCashRegisterDto } from "../dto/cash-register/close-cash-register.dto";
import { GetCurrentCashRegisterDto } from "../dto/cash-register/get-current-cash-register.dto";

/**
 * Repository abstracto para Cash Register
 * Define las operaciones que debe implementar cualquier repository de caja
 */
export abstract class CashRegisterRepository {
  abstract openCashRegister(dto: OpenCashRegisterDto): Promise<CashRegisterEntity>;
  abstract closeCashRegister(dto: CloseCashRegisterDto): Promise<CashRegisterEntity>;
  abstract getCurrentCashRegister(dto: GetCurrentCashRegisterDto): Promise<CashRegisterEntity | null>;
  abstract getCashRegisterById(cashRegisterId: string): Promise<CashRegisterEntity>;
  abstract updateCashRegisterTotals(
    cashRegisterId: string,
    orderTotal: number,
    paymentMethod: "Efectivo" | "Tarjeta" | "QR"
  ): Promise<void>;
}

