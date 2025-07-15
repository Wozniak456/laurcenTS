import { NextResponse } from "next/server";
import {
  getAllParameters,
  deleteParameter,
  createParameter,
} from "@/actions/CRUD/parameters";
import { db } from "@/db";

function replacer(key: string, value: any) {
  return typeof value === "bigint" ? value.toString() : value;
}

export async function GET() {
  const params = await getAllParameters();
  return new Response(JSON.stringify(params, replacer), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await deleteParameter(Number(id));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  // Check if this is a debug request
  if (body.action === "debug-feeding-param") {
    const param = await db.parameters.findFirst({
      where: { name: "Тип розрахунку годування" },
      include: {
        parametersvalues: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json({
      exists: !!param,
      parameter: param,
      allParams: await db.parameters.findMany({
        select: { id: true, name: true },
      }),
    });
  }

  // Regular parameter creation
  try {
    const param = await createParameter(body);
    return NextResponse.json(param);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
