import { PaymentRepository } from "../../domain";
import { PaymentDatasource, type VerificarPagoResult } from "../../domain/datasource/payment.datasource";

export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly paymentDatasource: PaymentDatasource) {}

  registrarDeuda(items: any, email: string, descripcion: string): Promise<any> {
    return this.paymentDatasource.registrarDeuda(items, email, descripcion);
  }
  consultarEstado(id: string): Promise<any> {
    return this.paymentDatasource.consultarEstado(id);
  }
  verificarPago(codigoRecaudacion: string): Promise<VerificarPagoResult> {
    return this.paymentDatasource.verificarPago(codigoRecaudacion);
  }
}
