import { getCostReport } from "@/actions/crutial/feedBatch";
import CostReportClient from "./CostReportClient";

export default async function CostReportPage() {
  const reportData = await getCostReport();

  // Format dates to strings before passing to client component
  const formattedData = reportData.map((item) => ({
    ...item,
    feeding_date: item.feeding_date.toISOString().split("T")[0], // Format as YYYY-MM-DD
  }));

  return <CostReportClient initialData={formattedData} />;
}
