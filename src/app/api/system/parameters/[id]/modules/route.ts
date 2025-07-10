import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { moduleIds } = await req.json();
  if (!Array.isArray(moduleIds))
    return NextResponse.json({ error: "Invalid moduleIds" }, { status: 400 });
  try {
    // Remove all existing references
    await prisma.parameter_module.deleteMany({ where: { parameter_id: id } });
    // Add new references
    await Promise.all(
      moduleIds.map((module_id: number) =>
        prisma.parameter_module.create({
          data: { parameter_id: id, module_id },
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
