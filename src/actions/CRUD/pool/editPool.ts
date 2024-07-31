'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function editPool(
    id: number,
    description: string | null,
    cleaning_frequency: number | null,
    water_temperature: number | null,
    x_location: number | null,
    y_location: number | null,
    pool_height: number | null,
    pool_width: number | null,
    pool_length: number | null
  ) {
    await db.pools.update({
      where: { id },
      data: {
        description,
        cleaning_frequency,
        water_temperature,
        x_location,
        y_location,
        pool_height,
        pool_width,
        pool_length
      }
    });
    redirect(`/pools/${id}`);
}