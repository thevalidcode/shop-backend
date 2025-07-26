import { Pool } from "pg";
import { PrismaClient } from "../../prisma/generated";
declare const prisma: PrismaClient<import("../../prisma/generated").Prisma.PrismaClientOptions, never, import("../../prisma/generated/runtime/library").DefaultArgs>;
declare const pool: Pool;
export { pool, prisma };
