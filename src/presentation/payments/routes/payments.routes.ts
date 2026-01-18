import { Router } from "express";
import { PaymentController } from "../controller/payment.controller";
import { PaymentRepositoryImpl } from "../../../infrastructure/repositories/payment.repository.impl";
import { PaymentDatasourceImpl } from "../../../infrastructure/datasource/payment.datasource.impl";

export class PaymentRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new PaymentDatasourceImpl();
    const repository = new PaymentRepositoryImpl(datasource);
    const controller = new PaymentController(repository);

    // 🔥 RUTAS IDENTICAS AL FRONTEND
    router.post("/generate-qr", controller.generateQr);
    router.get("/status/:id", controller.checkStatus);

    return router;
  }
}
