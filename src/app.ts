import { Router } from "express";
import { env } from "./config/env";
import { Server } from "./presentation/server";
// import { router } from "./presentation/routes";

(async () => {
  await main()
})();


async function main() {
  // const server = new Server({
  //   port: env.PORT,
  //   routes: router as Router,
  //   publicPath: env.PUBLIC_PATH,
  // });

  // server.start();
}
