'use server'
import { db } from "@/db";
import { items } from "@prisma/client";

export async function getUnits()
{
  try {
    console.log('getUnits started');
    
    const units = await db.units.findMany();

    return units;
  } catch (err: unknown) {
    console.error('Error in getUnits:', err);
    return [];
  }
}
