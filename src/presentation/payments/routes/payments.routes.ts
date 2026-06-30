import { Router } from "express";
import { PaymentController } from "../controller/payment.controller";
import { PaymentRepositoryImpl } from "../../../infrastructure/repositories/payment.repository.impl";
import { PaymentDatasourceImpl } from "../../../infrastructure/datasource/payment.datasource.impl";
import { QrCheckoutService } from "../../../domain/services/qr-checkout.service";

export class PaymentRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new PaymentDatasourceImpl();
    const repository = new PaymentRepositoryImpl(datasource);
    const qrCheckoutService = new QrCheckoutService(repository);
    const controller = new PaymentController(qrCheckoutService);

    router.post("/generate-qr", controller.generateQr);
    router.get("/status/:id", controller.checkStatus);
    router.post("/cancel-qr", controller.cancelQr);

    return router;
  }
}
