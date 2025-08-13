const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkFish() {
  try {
    console.log("Checking fish in location 61...");

    const fishTransactions = await prisma.itemtransactions.aggregate({
      _sum: { quantity: true },
      where: {
        location_id: 61,
        quantity: { gt: 0 },
      },
    });

    const totalFish = fishTransactions._sum.quantity || 0;
    console.log(`Total fish in location 61: ${totalFish}`);

    if (totalFish <= 0) {
      console.log("❌ Location 61 has no fish - feeding not allowed");
    } else {
      console.log("✅ Location 61 has fish - feeding should be allowed");
    }

    // Also check all transactions for location 61
    const allTransactions = await prisma.itemtransactions.findMany({
      where: {
        location_id: 61,
      },
      include: {
        itembatches: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      take: 10,
    });

    console.log(`\nLast 10 transactions for location 61:`);
    allTransactions.forEach((tran, index) => {
      console.log(
        `${index + 1}. ID: ${tran.id}, Quantity: ${tran.quantity}, Item: ${
          tran.itembatches?.items?.name || "Unknown"
        }`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFish();
