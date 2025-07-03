import { NextRequest, NextResponse } from "next/server";
import { getCostReportPivot } from "@/actions/crutial/feedBatch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    const date = searchParams.get("date");

    if (!batchId || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: batchId and date" },
        { status: 400 }
      );
    }

    // Call the new pivoted cost report function
    const { feedSummary, efficiencySummary } = await getCostReportPivot(
      parseInt(batchId),
      date
    );

    // Convert BigInt values to numbers for JSON serialization
    const serialize = (arr: any[]) =>
      arr.map((item) => {
        const out: any = {};
        for (const key in item) {
          if (typeof item[key] === "bigint") {
            out[key] = Number(item[key]);
          } else {
            out[key] = item[key];
          }
        }
        return out;
      });

    return NextResponse.json({
      feedSummary: serialize(feedSummary),
      efficiencySummary: serialize(efficiencySummary),
    });
  } catch (error) {
    console.error("Error in cost-report API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
