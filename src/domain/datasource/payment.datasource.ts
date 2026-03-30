export interface VerificarPagoResult {
  pagado: boolean;
  montoPagado: number;
  valorTotal: number;
}

export abstract class PaymentDatasource {
  abstract registrarDeuda(
    items: any,
    email: string,
    descripcion: string,
  ): Promise<any>;
  abstract consultarEstado(id: string): Promise<any>;
  abstract verificarPago(codigoRecaudacion: string): Promise<VerificarPagoResult>;
}
