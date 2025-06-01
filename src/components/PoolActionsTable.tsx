import React from "react";

interface Destination {
  dest_location_id: number;
  dest_location_name: string;
  dest_quantity: number;
  dest_avg_weight: number;
  action_doc_id: number;
  action_date: string;
  dest_batch_name?: string;
  // Add dest batch info here if available
}

interface PoolActionRow {
  parent_doc_id: number;
  source_location_id: number;
  source_date: string;
  source_location_name: string;
  start_qty: number;
  source_batch_name?: string;
  // Add source batch info here if available
  destinations: Destination[];
}

interface PoolActionsTableProps {
  data: PoolActionRow[];
  weekNum?: number;
  weekPeriod?: string;
}

export default function PoolActionsTable({
  data,
  weekNum,
  weekPeriod,
}: PoolActionsTableProps) {
  return (
    <div className="overflow-x-auto rounded shadow border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">
              Дата сортування
            </th>
            <th className="px-3 py-2 text-left font-semibold">
              Басейн (джерело)
            </th>
            <th className="px-3 py-2 text-left font-semibold">
              Стартова кількість
            </th>
            <th className="px-3 py-2 text-left font-semibold">
              Партія (яка сортується)
            </th>
            <th className="px-3 py-2 text-left font-semibold">Басейн (куди)</th>
            <th className="px-3 py-2 text-left font-semibold">Сер/вага</th>
            <th className="px-3 py-2 text-left font-semibold">Партія (куди)</th>
            <th className="px-3 py-2 text-left font-semibold">Кількість шт</th>
            <th className="px-3 py-2 text-left font-semibold">
              Підсумок відсортованих
            </th>
            <th className="px-3 py-2 text-left font-semibold">% відсоток</th>
            <th className="px-3 py-2 text-left font-semibold">Підпис</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-6 text-gray-400">
                Дані будуть відображені після підключення SQL
              </td>
            </tr>
          ) : (
            data.map((row, i) =>
              row.destinations.length > 0 ? (
                row.destinations.map((dest, j) => (
                  <tr
                    key={`${row.parent_doc_id}_${dest.dest_location_id}_${j}`}
                    className={
                      `${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors` +
                      (j === 0 ? " border-t-2 border-blue-200" : "")
                    }
                  >
                    {j === 0 && (
                      <>
                        <td
                          rowSpan={row.destinations.length}
                          className="px-3 py-2 align-top border-r border-gray-200 font-medium"
                        >
                          {row.source_date
                            ? new Date(row.source_date).toLocaleDateString()
                            : ""}
                        </td>
                        <td
                          rowSpan={row.destinations.length}
                          className="px-3 py-2 align-top border-r border-gray-200"
                        >
                          {row.source_location_name}
                        </td>
                        <td
                          rowSpan={row.destinations.length}
                          className="px-3 py-2 align-top border-r border-gray-200"
                        >
                          {row.start_qty}
                        </td>
                        <td
                          rowSpan={row.destinations.length}
                          className="px-3 py-2 align-top border-r border-gray-200"
                        >
                          {row.source_batch_name}
                        </td>
                      </>
                    )}
                    {j !== 0 && null}
                    <td className="px-3 py-2 border-r border-gray-200">
                      {dest.dest_location_name}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      {dest.dest_avg_weight ?? ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      {dest.dest_batch_name}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      {dest.dest_quantity}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200"></td>
                    <td className="px-3 py-2 border-r border-gray-200"></td>
                    <td className="px-3 py-2"></td>
                  </tr>
                ))
              ) : (
                <tr
                  key={row.parent_doc_id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2">
                    {row.source_date
                      ? new Date(row.source_date).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="px-3 py-2">{row.source_location_name}</td>
                  <td className="px-3 py-2">{row.start_qty}</td>
                  <td className="px-3 py-2">{/* source batch info */}</td>
                  <td className="px-3 py-2" colSpan={4}>
                    No destinations
                  </td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
