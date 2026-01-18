export abstract class PaymentDatasource {
  abstract registrarDeuda(
    items: any,
    email: string,
    descripcion: string,
  ): Promise<any>;
  abstract consultarEstado(id: string): Promise<any>;
}
