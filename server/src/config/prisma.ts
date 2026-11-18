import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generate/prisma/client";
import { env } from "./env";

const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL!,
})

const prisma = new PrismaClient({
    adapter,
});

export default prisma;