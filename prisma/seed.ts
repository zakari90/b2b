import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const business = await prisma.business.create({
    data: { name: "B2B Storefront" },
  });
  const businessId = business.id;

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create an Admin user
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      businessId,
      role: "admin",
      status: "ACTIVE",
    },
  });

  // Create a Saller (Manager) user
  await prisma.user.create({
    data: {
      email: "manager@example.com",
      username: "manager",
      password: hashedPassword,
      businessId,
      role: "saller",
      status: "ACTIVE",
    },
  });

  // Create a Buyer (Client) user
  await prisma.user.create({
    data: {
      email: "client@example.com",
      username: "client",
      password: hashedPassword,
      businessId,
      role: "buyer",
      status: "ACTIVE",
    },
  });

  // Create some initial inventory
  await prisma.product.createMany({
    data: [
      { name: "Industrial Processor", price: 299.99, quantity: 50, publisher: "admin", businessId },
      { name: "Thermal Sensor", price: 45.50, quantity: 200, publisher: "manager", businessId },
      { name: "Wireless Module", price: 12.00, quantity: 500, publisher: "admin", businessId },
    ]
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
