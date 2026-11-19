
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generate/prisma/client.js";
import bcrypt from "bcryptjs";

const requiredEnv = [
  "DATABASE_URL",
  "SEED_ADMIN_NAME",
  "SEED_ADMIN_EMAIL",
  "SEED_ADMIN_PASSWORD",
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]?.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const name = process.env.SEED_ADMIN_NAME!.trim();
const email = process.env.SEED_ADMIN_EMAIL!.trim().toLowerCase();
const plainPassword = process.env.SEED_ADMIN_PASSWORD!;

if (plainPassword.length < 12) {
  throw new Error("Admin password must be at least 12 characters long.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking production Admin account...");

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.role !== "ADMIN") {
      throw new Error(
        "This email already belongs to a non-Admin account. Choose another email."
      );
    }

    console.log("An Admin account with this email already exists.");
    console.log("No password or account details were changed.");
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Production Admin account created successfully.");
}

main()
  .catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
