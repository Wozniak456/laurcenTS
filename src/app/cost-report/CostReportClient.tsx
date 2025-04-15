"use client";

import CostReportTable from "../../components/CostReportTable";
import * as XLSX from "xlsx";

interface FeedingMetrics {
  feed_type_name: string;
  feed_batch_id: number;
  feeding_date: string;
  location_id: number;
  fish_batch_id: number | null;
  fish_weight: number | null;
  weight_category: string;
  total_feed_quantity: number;
  total_feed_cost: number;
  feed_per_fish: number;
  feed_cost_per_fish: number;
}

interface Props {
  initialData: FeedingMetrics[];
}

export default function CostReportClient({ initialData }: Props) {
  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Transform data to match template structure
    const transformedData = initialData.map((data: FeedingMetrics) => {
      return {
        "Тип корму": data.feed_type_name,
        "ID партії корму": data.feed_batch_id,
        "Дата годування": data.feeding_date,
        "ID локації": data.location_id,
        "ID партії риби": data.fish_batch_id || "N/A",
        "Вага риби (г)": data.fish_weight || "N/A",
        "Категорія ваги": data.weight_category,
        "Загальна кількість корму (кг)": data.total_feed_quantity,
        "Загальна вартість корму (грн)": data.total_feed_cost,
        "Корм на рибу (кг/шт)": data.feed_per_fish,
        "Вартість корму на рибу (грн/шт)": data.feed_cost_per_fish,
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(transformedData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Cost Report");

    // Save file
    XLSX.writeFile(
      wb,
      `cost_report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cost Report</h1>
          <button
            onClick={exportToExcel}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Export to Excel
          </button>
        </div>
        <CostReportTable data={initialData} />
      </main>
    </div>
  );
}
