import {
  CashRegisterEntity,
  CashRegisterDatasource,
  CashRegisterRepository,
  OpenCashRegisterDto,
  CloseCashRegisterDto,
  GetCurrentCashRegisterDto,
} from "../../domain";

export class CashRegisterRepositoryImpl implements CashRegisterRepository {
  constructor(private readonly cashRegisterDatasource: CashRegisterDatasource) {}

  openCashRegister(dto: OpenCashRegisterDto): Promise<CashRegisterEntity> {
    return this.cashRegisterDatasource.openCashRegister(dto);
  }

  closeCashRegister(dto: CloseCashRegisterDto): Promise<CashRegisterEntity> {
    return this.cashRegisterDatasource.closeCashRegister(dto);
  }

  getCurrentCashRegister(dto: GetCurrentCashRegisterDto): Promise<CashRegisterEntity | null> {
    return this.cashRegisterDatasource.getCurrentCashRegister(dto);
  }

  getCashRegisterById(cashRegisterId: string): Promise<CashRegisterEntity> {
    return this.cashRegisterDatasource.getCashRegisterById(cashRegisterId);
  }

  updateCashRegisterTotals(
    cashRegisterId: string,
    orderTotal: number,
    paymentMethod: "Efectivo" | "Tarjeta" | "QR"
  ): Promise<void> {
    return this.cashRegisterDatasource.updateCashRegisterTotals(cashRegisterId, orderTotal, paymentMethod);
  }
}

