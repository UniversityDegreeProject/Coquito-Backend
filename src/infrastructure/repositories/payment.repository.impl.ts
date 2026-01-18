import { PaymentRepository } from "../../domain";
import { PaymentDatasource } from "../../domain/datasource/payment.datasource";

export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly paymentDatasource: PaymentDatasource) {}

  registrarDeuda(items: any, email: string, descripcion: string): Promise<any> {
    return this.paymentDatasource.registrarDeuda(items, email, descripcion);
  }
  consultarEstado(id: string): Promise<any> {
    return this.paymentDatasource.consultarEstado(id);
  }
}
