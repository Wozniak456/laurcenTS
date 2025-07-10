import { NextResponse } from "next/server";
import { getParameterById, updateParameter } from "@/actions/CRUD/parameters";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function replacer(key: string, value: any) {
  return typeof value === "bigint" ? value.toString() : value;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const param = await prisma.parameters.findUnique({
    where: { id },
    include: {
      parametersvalues: true,
      parameterModules: { include: { modules: true } },
    },
  });
  if (!param) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new Response(JSON.stringify(param, replacer), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const data = await req.json();
  try {
    const updated = await updateParameter(id, data);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
