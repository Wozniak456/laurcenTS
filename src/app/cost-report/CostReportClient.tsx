"use client";

import { getCostReport } from "@/actions/crutial/feedBatch";
import React, { useState } from "react";

interface Batch {
  id: number;
  name: string;
}

interface Props {
  batches: Batch[];
  initialData?: any[];
}

function renderDate(val: any) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  // Prisma may return dates as objects with toISOString
  if (typeof val === "object" && typeof val.toISOString === "function")
    return val.toISOString().slice(0, 10);
  return String(val);
}

export default function CostReportClient({ batches, initialData }: Props) {
  const [batchId, setBatchId] = useState(
    batches.length > 0 ? String(batches[0].id) : ""
  );
  const [date, setDate] = useState("");
  const [results, setResults] = useState<any[]>(initialData ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stockTotals, setStockTotals] = useState<{
    tot_stock: number;
    tot_weight: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("I am here or not???");
    try {
      const data = await getCostReport(Number(batchId), date);
      setResults(data);
      // Format date as YYYY-MM-DD for the stock API
      let formattedDate = date;
      if (date && date.length > 10) {
        formattedDate = new Date(date).toISOString().slice(0, 10);
      }
      console.log("formattedDate : %s", formattedDate);
      console.log("batchId : %s", batchId);
      // Fetch total stock and weight
      const totalsRes = await fetch(
        `/api/cost-report/stock?batchId=${batchId}&date=${formattedDate}&mode=totals`
      );
      if (totalsRes.ok) {
        const totalsData = await totalsRes.json();
        setStockTotals({
          tot_stock: totalsData.tot_stock ?? 0,
          tot_weight: totalsData.tot_weight ?? 0,
        });
      } else {
        setStockTotals(null);
      }
    } catch (err: any) {
      setError(err.message || "Error fetching report");
      setStockTotals(null);
    } finally {
      setLoading(false);
    }
  };

  // Feed Type Pivot: sort by granule size (number before space)
  const feedTypesSorted = Array.from(
    new Set(results.map((r) => r.feed_type_name))
  ).sort((a, b) => {
    const getNum = (s: string) => {
      const n = parseFloat(s.split(" ")[0]);
      return isNaN(n) ? Number.MAX_VALUE : n;
    };
    return getNum(a) - getNum(b);
  });
  // Weight Category Pivot: sort by lower bound of range (e.g., '100-200g' => 100, '0-50g' => 0)
  const weightCategoriesSorted = Array.from(
    new Set(results.map((r) => r.weight_category))
  ).sort((a, b) => {
    const getNum = (s: string) => {
      if (!s) return Number.MAX_VALUE;
      const match = s.match(/(\d+)[^\d]+(\d+)/); // e.g. 100-200g
      if (match) return parseInt(match[1], 10);
      const single = s.match(/(\d+)/);
      if (single) return parseInt(single[1], 10);
      return Number.MAX_VALUE;
    };
    return getNum(a) - getNum(b);
  });

  // Calculate summary values
  const totStock = stockTotals?.tot_stock ?? 0;
  const totWeight = stockTotals?.tot_weight ?? 0;
  const avgWeightKg = totStock > 0 ? totWeight / totStock : 0;
  let totalCost = 0;
  if (results.length > 0) {
    totalCost = results.reduce(
      (acc, r) => acc + Number(r.total_feed_cost || 0),
      0
    );
  }
  const pricePerStock = totStock > 0 ? totalCost / totStock : 0;
  const pricePerKg = totWeight > 0 ? totalCost / totWeight : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Cost Report</h1>
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col md:flex-row md:items-end gap-4"
      >
        <div>
          <label className="font-semibold mr-2">Fish Batch:</label>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
            className="px-3 py-2 border rounded shadow-sm focus:ring focus:border-blue-400"
          >
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} (ID: {batch.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold mr-2">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="px-3 py-2 border rounded shadow-sm focus:ring focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </form>
      {/* Summary line */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg shadow px-6 py-3 flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <span className="font-semibold">Total stock qty:</span>
          <span className="tabular-nums text-right min-w-[80px]">
            {stockTotals
              ? totStock.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : "-"}
          </span>
          <span className="font-semibold ml-4">Total weight (kg):</span>
          <span className="tabular-nums text-right min-w-[80px]">
            {stockTotals
              ? totWeight.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "-"}
          </span>
          <span className="font-semibold ml-4">Avg weight (kg):</span>
          <span className="tabular-nums text-right min-w-[80px]">
            {stockTotals && avgWeightKg
              ? avgWeightKg.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })
              : "-"}
          </span>
          <span className="font-semibold ml-4">Price per pcs:</span>
          <span className="tabular-nums text-right min-w-[80px]">
            {pricePerStock
              ? pricePerStock.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "-"}
          </span>
          <span className="font-semibold ml-4">Price per 1kg:</span>
          <span className="tabular-nums text-right min-w-[80px]">
            {pricePerKg
              ? pricePerKg.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "-"}
          </span>
        </div>
      </div>
      {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
      {results.length === 0 && !loading && !error && (
        <div className="text-gray-500 italic mb-4">
          No results found for the selected batch and date.
        </div>
      )}
      {results.length > 0 && (
        <>
          {/* Pivots side by side above the main table */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Feed Type Pivot */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-4 flex-1">
              <h2 className="text-lg font-bold mb-2 text-blue-700">
                Feed Types
              </h2>
              <table className="w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-2"></th>
                    {feedTypesSorted.map((feedType) => (
                      <th
                        key={feedType}
                        className="p-2 font-semibold text-center border-b border-blue-200"
                      >
                        {feedType}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold bg-gray-50">
                    <td className="p-2">sum quantity</td>
                    {feedTypesSorted.map((feedType) => {
                      const sumQty = results
                        .filter((r) => r.feed_type_name === feedType)
                        .reduce(
                          (acc, r) => acc + Number(r.total_feed_quantity || 0),
                          0
                        );
                      return (
                        <td
                          key={feedType}
                          className="p-2 text-right border-b border-blue-100"
                        >
                          {sumQty.toFixed(3)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="font-bold bg-gray-100">
                    <td className="p-2">sum cost</td>
                    {feedTypesSorted.map((feedType) => {
                      const sumCost = results
                        .filter((r) => r.feed_type_name === feedType)
                        .reduce(
                          (acc, r) => acc + Number(r.total_feed_cost || 0),
                          0
                        );
                      return (
                        <td
                          key={feedType}
                          className="p-2 text-right border-b border-blue-100"
                        >
                          {sumCost.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Weight Category Pivot */}
            <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4 flex-1">
              <h2 className="text-lg font-bold mb-2 text-green-700">
                Weight Categories
              </h2>
              <table className="w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-green-50">
                    <th className="p-2"></th>
                    {weightCategoriesSorted.map((wc) => (
                      <th
                        key={wc}
                        className="p-2 font-semibold text-center border-b border-green-200"
                      >
                        {wc}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold bg-gray-50">
                    <td className="p-2">sum quantity</td>
                    {weightCategoriesSorted.map((wc) => {
                      const sumQty = results
                        .filter((r) => r.weight_category === wc)
                        .reduce(
                          (acc, r) => acc + Number(r.total_feed_quantity || 0),
                          0
                        );
                      return (
                        <td
                          key={wc}
                          className="p-2 text-right border-b border-green-100"
                        >
                          {sumQty.toFixed(3)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="font-bold bg-gray-100">
                    <td className="p-2">sum cost</td>
                    {weightCategoriesSorted.map((wc) => {
                      const sumCost = results
                        .filter((r) => r.weight_category === wc)
                        .reduce(
                          (acc, r) => acc + Number(r.total_feed_cost || 0),
                          0
                        );
                      return (
                        <td
                          key={wc}
                          className="p-2 text-right border-b border-green-100"
                        >
                          {sumCost.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Main table below pivots */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 overflow-x-auto">
            <table className="w-full text-xs border-separate border-spacing-0 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                  <th className="p-2">feed_type_name</th>
                  <th className="p-2">feed_batch_id</th>
                  <th className="p-2">feeding_date</th>
                  <th className="p-2">location_id</th>
                  <th className="p-2">fish_weight</th>
                  <th className="p-2">weight_category</th>
                  <th className="p-2 text-right">total_feed_quantity</th>
                  <th className="p-2 text-right">total_feed_cost</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      idx % 2 === 0
                        ? "bg-gray-50 hover:bg-blue-50 transition"
                        : "bg-white hover:bg-blue-50 transition"
                    }
                  >
                    <td className="p-2">{row.feed_type_name}</td>
                    <td className="p-2 text-right">
                      {row.feed_batch_id ??
                        row.feedBatchId ??
                        row.feed_batch ??
                        "?"}
                    </td>
                    <td className="p-2 text-center">
                      {renderDate(row.feeding_date)}
                    </td>
                    <td className="p-2 text-right">{row.location_id}</td>
                    <td className="p-2 text-right">{row.fish_weight}</td>
                    <td className="p-2 text-center">{row.weight_category}</td>
                    <td className="p-2 text-right">
                      {row.total_feed_quantity !== undefined &&
                      row.total_feed_quantity !== null
                        ? Number(row.total_feed_quantity).toFixed(3)
                        : ""}
                    </td>
                    <td className="p-2 text-right">
                      {row.total_feed_cost !== undefined &&
                      row.total_feed_cost !== null
                        ? Number(row.total_feed_cost).toFixed(2)
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
