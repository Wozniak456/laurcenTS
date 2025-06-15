import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // All old migration logic removed. If you need to seed new data, add it here.
  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
