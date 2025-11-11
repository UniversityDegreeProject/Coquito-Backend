import { CashRegisterEntity } from "../../entities/cash-register.entity";
import { OpenCashRegisterDto } from "../../dto/cash-register/open-cash-register.dto";
import { CashRegisterRepository } from "../../repositories/cash-register.repository";

/**
 * Caso de uso para abrir una nueva caja
 * Valida que el usuario no tenga ya una caja abierta
 */
interface OpenCashRegisterUseCase {
  execute(dto: OpenCashRegisterDto): Promise<CashRegisterEntity>;
}

export class OpenCashRegisterUseCaseImpl implements OpenCashRegisterUseCase {
  constructor(private readonly cashRegisterRepository: CashRegisterRepository) {}

  execute(dto: OpenCashRegisterDto): Promise<CashRegisterEntity> {
    return this.cashRegisterRepository.openCashRegister(dto);
  }
}

