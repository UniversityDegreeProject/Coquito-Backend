import { get } from "env-var";


export const env = {
  PORT : get("PORT").default(3000).asPortNumber(),
  PUBLIC_PATH : get("PUBLIC_PATH").default("./public").asString(),
  POSTGRES_USER : get("POSTGRES_USER").required().asString(),
  POSTGRES_PASSWORD : get("POSTGRES_PASSWORD").required().asString(),
  POSTGRES_DB : get("POSTGRES_DB").required().asString(),
  PGADMIN_DEFAULT_EMAIL : get("PGADMIN_DEFAULT_EMAIL").required().asString(),
  PGADMIN_DEFAULT_PASSWORD : get("PGADMIN_DEFAULT_PASSWORD").required().asString(),
}