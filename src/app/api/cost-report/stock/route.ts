import { NextRequest, NextResponse } from "next/server";
import {
  getBatchStockQty,
  getBatchTotalStockAndWeight,
} from "@/actions/crutial/feedBatch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    const date = searchParams.get("date");
    const mode = searchParams.get("mode");
    if (!batchId || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: batchId and date" },
        { status: 400 }
      );
    }
    if (mode === "totals") {
      const { tot_stock, tot_weight } = await getBatchTotalStockAndWeight(
        Number(batchId),
        date
      );
      return NextResponse.json({ tot_stock, tot_weight });
    } else {
      const stockQty = await getBatchStockQty(Number(batchId), date);
      return NextResponse.json({ stockQty });
    }
  } catch (error) {
    console.error("Error in cost-report/stock API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
