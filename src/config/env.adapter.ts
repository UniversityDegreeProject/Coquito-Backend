import envVar from "env-var";
const { get } = envVar;
import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: get("PORT").default(3000).asPortNumber(),
  PUBLIC_PATH: get("PUBLIC_PATH").default("./public").asString(),

  JWT_SEED: get("JWT_SEED").required().asString(),

  MAILER_PROVIDER: get("MAILER_PROVIDER").required().asString(),
  MAILER_API_KEY: get("RESEND_API_KEY").asString(),
  MAILER_SERVICE: get("MAILER_SERVICE").asString(),
  MAILER_EMAIL: get("MAILER_EMAIL").asString(),
  MAILER_SECRET_KEY: get("MAILER_SECRET_KEY").asString(),

  MAILER_FROM_EMAIL: get("MAILER_FROM_EMAIL")
    .default("Embutidos Coquito <soporte-coquito@jezedev.pro>")
    .asString(),

  WEBSERVICE_URL: get("WEBSERVICE_URL")
    .default("http://localhost:3000/api")
    .asString(),
  FRONTEND_URL: get("FRONTEND_URL").default("http://localhost:5173").asString(),
};
