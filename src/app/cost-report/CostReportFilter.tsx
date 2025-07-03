"use client";
import { useState, FormEvent } from "react";
import CostReportClient from "./CostReportClient";

interface Batch {
  id: number;
  name: string;
}

export default function CostReportFilter({ batches }: { batches: Batch[] }) {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReportData(null);
    try {
      // Call an API route or server action to fetch the filtered report
      const res = await fetch(
        `/api/cost-report?batchId=${selectedBatch}&date=${selectedDate}`
      );
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setReportData(data);
    } catch (err) {
      setError("Помилка при отриманні звіту. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <form
        className="flex flex-col md:flex-row gap-4 items-end"
        onSubmit={handleGenerate}
      >
        <div className="flex flex-col">
          <label htmlFor="batch" className="mb-1 font-medium">
            Партія риби
          </label>
          <select
            id="batch"
            className="border rounded p-2 min-w-[200px]"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            required
          >
            <option value="">Оберіть партію</option>
            {batches.map((batch: Batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1 font-medium">
            Дата
          </label>
          <input
            id="date"
            type="date"
            className="border rounded p-2 min-w-[160px]"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
          disabled={loading}
        >
          {loading ? "Генеруємо..." : "Згенерувати"}
        </button>
      </form>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      <div className="mt-8">
        {reportData && reportData.length > 0 ? (
          <CostReportClient batches={batches} initialData={reportData} />
        ) : reportData && reportData.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            Немає даних для обраної партії та дати
          </div>
        ) : null}
      </div>
    </div>
  );
}
