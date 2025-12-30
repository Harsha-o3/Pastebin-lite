// Ensure the Prisma engine type is set before loading the client
process.env.PRISMA_CLIENT_ENGINE = process.env.PRISMA_CLIENT_ENGINE ?? "binary";

// Use a dynamic require so the environment variable above is applied
const { PrismaClient } = require("@prisma/client") as { PrismaClient: any };

// Load a MariaDB adapter factory when available and the provider is MySQL/MariaDB
let adapterFactory: any = undefined;
try {
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb") as { PrismaMariaDb: any };
  // Pass the same connection string the client will use
  adapterFactory = new PrismaMariaDb(process.env.DATABASE_URL);
} catch (e) {
  console.warn("[prisma] no MariaDB adapter available or failed to instantiate adapter:", e?.message ?? e);
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapterFactory,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
