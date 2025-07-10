import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const modules = await prisma.modules.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(modules);
}
