import { CashRegisterRepository } from "../../repositories/cash-register.repository";
import { GetCashRegisterHistoryDto } from "../../dto/cash-register/get-cash-register-history.dto";
import { CashRegisterEntity } from "../../entities/cash-register.entity";
import { PaginateResponse } from "../../interfaces/shared/paginated-response.interface";

/**
 * Caso de uso para obtener el historial de cierres de caja
 * Retorna lista paginada de cajas cerradas
 */
interface GetCashRegisterHistoryUseCase {
  execute(dto: GetCashRegisterHistoryDto): Promise<PaginateResponse<CashRegisterEntity>>;
}

export class GetCashRegisterHistoryUseCaseImpl implements GetCashRegisterHistoryUseCase {
  constructor(private readonly cashRegisterRepository: CashRegisterRepository) {}

  execute(dto: GetCashRegisterHistoryDto): Promise<PaginateResponse<CashRegisterEntity>> {
    return this.cashRegisterRepository.getCashRegisterHistory(dto);
  }
}
