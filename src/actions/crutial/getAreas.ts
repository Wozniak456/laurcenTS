"use server";
import { db } from "@/db";

export async function getAreas() {
  return await db.productionareas.findMany({
    include: {
      productionlines: {
        include: {
          pools: {
            include: {
              locations: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}
