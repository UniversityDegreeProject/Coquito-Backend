import dotenv from "dotenv";
// En producción (Seenode), las variables vienen directo de process.env
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env" });
}
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("POSTGRES_URL"),
  },
});
