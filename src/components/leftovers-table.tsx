"use client";

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
}

export default function LeftoversTable({ data }: LeftoversTableProps) {
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
        {data ? (
          data
            .sort((a, b) => a.feed_type_name.localeCompare(b.feed_type_name))
            .map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">{item.batch_id}</TableCell>
                <TableCell className="text-center">{item.batch_name}</TableCell>
                <TableCell className="text-center">
                  {item.feed_type_name}
                </TableCell>
                <TableCell className="text-center">{item.item_name}</TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.start_saldo) < 0.001
                    ? "0.00"
                    : item.start_saldo.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.incoming) < 0.001
                    ? "0.00"
                    : item.incoming.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.outcoming) < 0.001
                    ? "0.00"
                    : item.outcoming.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {Math.abs(item.end_saldo) < 0.001
                    ? "0.00"
                    : item.end_saldo.toFixed(2)}
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
