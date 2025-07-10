import { NextResponse } from "next/server";
import {
  getAllParameters,
  deleteParameter,
  createParameter,
} from "@/actions/CRUD/parameters";

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
  const data = await request.json();
  try {
    const param = await createParameter(data);
    return NextResponse.json(param);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
