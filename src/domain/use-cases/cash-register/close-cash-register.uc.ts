import { CashRegisterEntity } from "../../entities/cash-register.entity";
import { CloseCashRegisterDto } from "../../dto/cash-register/close-cash-register.dto";
import { CashRegisterRepository } from "../../repositories/cash-register.repository";

/**
 * Caso de uso para cerrar una caja existente
 * Calcula la diferencia entre el monto esperado y el monto real
 */
interface CloseCashRegisterUseCase {
  execute(dto: CloseCashRegisterDto): Promise<CashRegisterEntity>;
}

export class CloseCashRegisterUseCaseImpl implements CloseCashRegisterUseCase {
  constructor(private readonly cashRegisterRepository: CashRegisterRepository) {}

  execute(dto: CloseCashRegisterDto): Promise<CashRegisterEntity> {
    return this.cashRegisterRepository.closeCashRegister(dto);
  }
}

