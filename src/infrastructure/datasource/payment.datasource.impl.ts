import axios from "axios";
import { PaymentDatasource } from "../../domain/datasource/payment.datasource";

export class PaymentDatasourceImpl implements PaymentDatasource {
  private readonly apiUrl = process.env.LIBELULA_API_URL!;
  private readonly appKey = process.env.LIBELULA_APP_KEY!;

  async registrarDeuda(items: any[], email: string, descripcion: string) {
    // Generamos un ID único para que Libélula no rechace transacciones duplicadas
    const identificadorInterno = `POS-${Date.now()}`;

    const { data } = await axios.post(`${this.apiUrl}/deuda/registrar`, {
      appkey: this.appKey,
      email_cliente: email,
      identificador_deuda: identificadorInterno,
      descripcion: descripcion,
      lineas_detalle_deuda: items,
    });
    console.log(data);
    return data;
  }

  async consultarEstado(idRecaudacion: string) {
    const { data } = await axios.post(
      `${this.apiUrl}/deuda/consultar_deudas/por_identificador`,
      {
        appkey: this.appKey,
        codigo_recaudacion: idRecaudacion, //? codigo numerico cite: 666
      },
    );
    console.log(data);
    return data;
  }
}
