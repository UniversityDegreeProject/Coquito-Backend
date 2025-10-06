import { Router } from "express";
import { env } from "./config/env.adapter";
import { Server } from "./presentation/server";
import { AppRoutes } from "./presentation/route.app";
// import { router } from "./presentation/routes";

(async () => {
  await main()
})();


async function main() {
  const server = new Server({
    port: env.PORT,
    routes: AppRoutes.routes,
    publicPath: env.PUBLIC_PATH,
  });

  server.start();
}
