import { NextResponse } from "next/server";
import {
  getParameterById,
  getParameterValues,
  addParameterValue,
  deleteParameterValue,
} from "@/actions/CRUD/parameters";

function replacer(key: string, value: any) {
  return typeof value === "bigint" ? value.toString() : value;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const parameter = await getParameterById(id);
    const values = await getParameterValues(id);
    return new Response(JSON.stringify({ parameter, values }, replacer), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const { value, date } = await request.json();
    const result = await addParameterValue(id, value, new Date(date));
    return new Response(JSON.stringify(result, replacer), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const valueId = url.searchParams.get("valueId");
  if (!valueId)
    return NextResponse.json({ error: "Missing valueId" }, { status: 400 });
  try {
    await deleteParameterValue(valueId);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
