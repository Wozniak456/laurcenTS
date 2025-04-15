"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";

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
  data: FeedingMetrics[];
}

export default function CostReportTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Тип корму</th>
            <th className="px-4 py-2 border">ID партії корму</th>
            <th className="px-4 py-2 border">Дата годування</th>
            <th className="px-4 py-2 border">ID локації</th>
            <th className="px-4 py-2 border">ID партії риби</th>
            <th className="px-4 py-2 border">Вага риби (г)</th>
            <th className="px-4 py-2 border">Категорія ваги</th>
            <th className="px-4 py-2 border">Кількість корму (кг)</th>
            <th className="px-4 py-2 border">Вартість корму (грн)</th>
            <th className="px-4 py-2 border">Корм на рибу (кг/шт)</th>
            <th className="px-4 py-2 border">Вартість на рибу (грн/шт)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={`${row.feed_batch_id}-${row.feeding_date}-${row.location_id}`}
            >
              <td className="px-4 py-2 border">{row.feed_type_name}</td>
              <td className="px-4 py-2 border">{row.feed_batch_id}</td>
              <td className="px-4 py-2 border">{row.feeding_date}</td>
              <td className="px-4 py-2 border">{row.location_id}</td>
              <td className="px-4 py-2 border">{row.fish_batch_id || "N/A"}</td>
              <td className="px-4 py-2 border">
                {row.fish_weight?.toFixed(2) || "N/A"}
              </td>
              <td className="px-4 py-2 border">{row.weight_category}</td>
              <td className="px-4 py-2 border">
                {row.total_feed_quantity.toFixed(2)}
              </td>
              <td className="px-4 py-2 border">
                {row.total_feed_cost.toFixed(2)}
              </td>
              <td className="px-4 py-2 border">
                {row.feed_per_fish.toFixed(3)}
              </td>
              <td className="px-4 py-2 border">
                {row.feed_cost_per_fish.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
