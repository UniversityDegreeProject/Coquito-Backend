import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma";
import pg from "pg";

const connectionString = process.env.POSTGRES_URL || "";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prismaClient = new PrismaClient({ adapter });
