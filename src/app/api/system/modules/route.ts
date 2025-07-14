import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const modules = await prisma.modules.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(modules);
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    const newModule = await prisma.modules.create({
      data: { name, description },
    });
    return NextResponse.json(newModule, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error creating module",
        details: error instanceof Error ? error.message : error,
      },
      { status: 400 }
    );
  }
}
