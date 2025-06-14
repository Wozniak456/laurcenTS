import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Set the initial date for all historical records
  const initialDate = new Date("2025-03-01T00:00:00.000Z");
  const defaultEmployeeId = 3; // Default employee ID as integer

  // Migrate priorities
  const priorities = await prisma.priorities.findMany();
  for (const priority of priorities) {
    await prisma.priorityHistory.create({
      data: {
        location_id: priority.location_id,
        item_id: priority.item_id,
        priority: priority.priority,
        valid_from: initialDate,
        created_by: defaultEmployeeId,
      },
    });
  }

  // Migrate percent_feeding
  const pools = await prisma.pools.findMany({
    where: {
      percent_feeding: {
        not: null,
      },
    },
  });

  for (const pool of pools) {
    if (pool.percent_feeding !== null) {
      await prisma.percentFeedingHistory.create({
        data: {
          pool_id: pool.id,
          percent_feeding: pool.percent_feeding,
          valid_from: initialDate,
          created_by: defaultEmployeeId,
        },
      });
    }
  }

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
