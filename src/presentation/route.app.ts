import { Router } from "express";
import { AuthRoutes } from "./auth/routes/auth.route";
import { UserRoutes } from "./users/routes/user.routes";
import { CategoryRoutes } from "./categories/routes/category.routes";
import { ProductRoutes } from "./products/routes/product.routes";
import { CustomerRoutes } from "./customers/routes/customer.routes";
import { StockMovementRoutes } from "./stock-movements/routes/stock-movement.routes";
import { CashRegisterRoutes } from "./cash-register/routes/cash-register.routes";
import { SaleRoutes } from "./sales/routes/sale.routes";
import { ReportRoutes } from "./reports/routes/report.routes";
import { SystemConfigRoutes } from "./system-config/routes/system-config.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/users", UserRoutes.routes);
    router.use("/api/categories", CategoryRoutes.routes);
    router.use("/api/products", ProductRoutes.routes);
    router.use("/api/customers", CustomerRoutes.routes);
    router.use("/api/stock-movements", StockMovementRoutes.routes);
    router.use("/api/cash-register", CashRegisterRoutes.routes);
    router.use("/api/sales", SaleRoutes.routes);
    router.use("/api/reports", ReportRoutes.routes);
    router.use("/api/system-config", SystemConfigRoutes.routes);

    return router;
  }
}
