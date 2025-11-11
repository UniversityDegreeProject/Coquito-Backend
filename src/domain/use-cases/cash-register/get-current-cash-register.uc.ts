import { CashRegisterEntity } from "../../entities/cash-register.entity";
import { GetCurrentCashRegisterDto } from "../../dto/cash-register/get-current-cash-register.dto";
import { CashRegisterRepository } from "../../repositories/cash-register.repository";

/**
 * Caso de uso para obtener la caja actualmente abierta de un usuario
 * Retorna null si el usuario no tiene una caja abierta
 */
interface GetCurrentCashRegisterUseCase {
  execute(dto: GetCurrentCashRegisterDto): Promise<CashRegisterEntity | null>;
}

export class GetCurrentCashRegisterUseCaseImpl implements GetCurrentCashRegisterUseCase {
  constructor(private readonly cashRegisterRepository: CashRegisterRepository) {}

  execute(dto: GetCurrentCashRegisterDto): Promise<CashRegisterEntity | null> {
    return this.cashRegisterRepository.getCurrentCashRegister(dto);
  }
}

