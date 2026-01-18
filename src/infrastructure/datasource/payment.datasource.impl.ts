import axios from "axios";
import { PaymentDatasource } from "../../domain/datasource/payment.datasource";

export class PaymentDatasourceImpl implements PaymentDatasource {
  private readonly apiUrl = process.env.LIBELULA_API_URL!;
  private readonly appKey = process.env.LIBELULA_APP_KEY!;

  async registrarDeuda(items: any[], email: string, descripcion: string) {
    // Generamos un ID único para que Libélula no rechace transacciones duplicadas
    const identificadorInterno = `POS-${Date.now()}`;

    const { data } = await axios.post(`${this.apiUrl}/deuda/registrar`, {
      appkey: this.appKey, //
      email_cliente: email, // Dinámico
      identificador_deuda: identificadorInterno, // Único por cada intento
      descripcion: descripcion, // Dinámico
      lineas_detalle_deuda: items, // Ya mapeado con concepto, cantidad, costo_unitario [cite: 47]
    });
    console.log(data);
    return data; // Retorna qr_simple_url e id_transaccion
  }

  async consultarEstado(idRecaudacion: string) {
    // Servicio oficial: Consulta por Identificador [cite: 661]
    const { data } = await axios.post(
      `${this.apiUrl}/deuda/consultar_deudas/por_identificador`,
      {
        appkey: this.appKey,
        codigo_recaudacion: idRecaudacion, // Usamos el código numérico [cite: 666]
      },
    );
    return data;
  }
}
