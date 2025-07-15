"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";

interface LeftoversTableProps {
  data: {
    batch_id: string;
    batch_name: string;
    feed_type_name: string;
    item_name: string;
    start_saldo: number;
    incoming: number;
    outcoming: number;
    end_saldo: number;
  }[];
  periodEndDate?: string; // End date of the period for cleanup
  onSelectionChange?: (selectedItem: any) => void; // Callback for selection changes
}

export default function LeftoversTable({
  data,
  periodEndDate,
  onSelectionChange,
}: LeftoversTableProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Filter out rows where all values are 0.000 after rounding to 3 decimals
  const filteredData = data?.filter((item) => {
    const startRounded =
      Math.abs(item.start_saldo) < 0.0001
        ? 0
        : Number(item.start_saldo.toFixed(3));
    const incomingRounded =
      Math.abs(item.incoming) < 0.0001 ? 0 : Number(item.incoming.toFixed(3));
    const outcomingRounded =
      Math.abs(item.outcoming) < 0.0001 ? 0 : Number(item.outcoming.toFixed(3));
    const endRounded =
      Math.abs(item.end_saldo) < 0.0001 ? 0 : Number(item.end_saldo.toFixed(3));

    // Show row if at least one value is not 0.000
    return (
      startRounded !== 0 ||
      incomingRounded !== 0 ||
      outcomingRounded !== 0 ||
      endRounded !== 0
    );
  });

  const handleRowClick = (index: number) => {
    console.log(
      "Row clicked:",
      index,
      "Current selected:",
      selectedRow,
      "Filtered data length:",
      filteredData?.length
    );
    const newSelectedRow = selectedRow === index ? null : index;
    setSelectedRow(newSelectedRow);

    // Notify parent of selection change
    if (onSelectionChange) {
      const selectedItem =
        newSelectedRow !== null && filteredData
          ? filteredData[newSelectedRow]
          : null;
      onSelectionChange(selectedItem);
    }
  };

  return (
    <Table aria-label="" isStriped>
      <TableHeader>
        <TableColumn className="text-center">Batch ID</TableColumn>
        <TableColumn className="text-center">Batch name</TableColumn>
        <TableColumn className="text-center">Feed type</TableColumn>
        <TableColumn className="text-center">Item name</TableColumn>
        <TableColumn className="text-center">Start</TableColumn>
        <TableColumn className="text-center">Income</TableColumn>
        <TableColumn className="text-center">Outcome</TableColumn>
        <TableColumn className="text-center">Actual</TableColumn>
      </TableHeader>
      <TableBody>
        {filteredData ? (
          filteredData
            .sort((a, b) => a.feed_type_name.localeCompare(b.feed_type_name))
            .map((item, index) => (
              <TableRow
                key={index}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRow === index
                    ? "bg-blue-200 shadow-md ring-2 ring-blue-400"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleRowClick(index)}
              >
                <TableCell className="text-center">{item.batch_id}</TableCell>
                <TableCell className="text-center">{item.batch_name}</TableCell>
                <TableCell className="text-center">
                  {item.feed_type_name}
                </TableCell>
                <TableCell className="text-center">{item.item_name}</TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.start_saldo) < 0.0001
                    ? "0.000"
                    : item.start_saldo.toFixed(3)}
                </TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.incoming) < 0.0001
                    ? "0.000"
                    : item.incoming.toFixed(3)}
                </TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.outcoming) < 0.0001
                    ? "0.000"
                    : item.outcoming.toFixed(3)}
                </TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.end_saldo) < 0.0001
                    ? "0.000"
                    : item.end_saldo.toFixed(3)}
                </TableCell>
              </TableRow>
            ))
        ) : (
          <TableRow>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">2</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
