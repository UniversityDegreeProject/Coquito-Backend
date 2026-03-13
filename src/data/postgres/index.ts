import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma";
import pg from "pg";

const connectionString = process.env.POSTGRES_URL || "";
const isProduction = process.env.NODE_ENV === "production";

const pool = new pg.Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
const adapter = new PrismaPg(pool);
export const prismaClient = new PrismaClient({ adapter });
