"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import * as actions from "@/actions";
import LeftoversTable from "@/components/leftovers-table";
import ExportButton from "@/components/leftoversTableToPrint";
// Removed Modal and Button imports - cleanup functionality moved to Inventory Counting

export const dynamic = "force-dynamic";

interface LeftoversPerPeriodProps {
  params: {
    period: string;
  };
}

interface DataItem {
  batch_id: string;
  batch_name: string;
  feed_type_name: string;
  item_name: string;
  start_saldo: number;
  incoming: number;
  outcoming: number;
  end_saldo: number;
  inventory_counting_qty: number; // New field for inventory counting
}

export default function LeftoversPerPeriod(props: LeftoversPerPeriodProps) {
  // Removed selectedItem and isCleaning state - cleanup functionality moved to Inventory Counting
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  // Removed modal disclosure - cleanup functionality moved to Inventory Counting

  // Memoize parts to prevent unnecessary re-renders
  const parts = useMemo(
    () => props.params.period.split("_"),
    [props.params.period]
  );
  const startDate = useMemo(() => parts[0], [parts]);
  const endDate = useMemo(() => parts[1], [parts]);

  const fetchData = useCallback(async () => {
    console.log("Starting fetchData...");
    setLoading(true);
    try {
      let StartSaldoDate = new Date(startDate);
      const EndSaldoDate1 = new Date(endDate);

      const EndSaldoDate: Date = new Date(EndSaldoDate1);
      EndSaldoDate.setDate(EndSaldoDate.getDate() + 1);

      console.log("Fetching saldo data...");
      const end_saldo = await actions.calculateSaldo(
        undefined,
        EndSaldoDate,
        undefined
      );
      const start_saldo = await actions.calculateSaldo(
        undefined,
        StartSaldoDate,
        undefined
      );
      const incoming = await actions.calculateSaldo(
        StartSaldoDate,
        EndSaldoDate,
        { gt: 0 }
      );
      const outcoming = await actions.calculateSaldo(
        StartSaldoDate,
        EndSaldoDate,
        { lt: 0 }
      );

      let newData: DataItem[] = [];

      for (const batch_id in end_saldo) {
        if (Object.prototype.hasOwnProperty.call(end_saldo, batch_id)) {
          const inventoryCountingQty =
            end_saldo[batch_id]?.inventory_counting_qty || 0;
          const originalIncoming = incoming[batch_id]?.qty
            ? incoming[batch_id].qty
            : 0;
          const originalOutcoming = outcoming[batch_id]?.qty
            ? outcoming[batch_id].qty
            : 0;

          // Adjust income and outcome based on inventory counting
          let adjustedIncoming = originalIncoming;
          let adjustedOutcoming = originalOutcoming;

          if (inventoryCountingQty > 0) {
            // Positive inventory counting: subtract from income
            adjustedIncoming = originalIncoming - inventoryCountingQty;
          } else if (inventoryCountingQty < 0) {
            // Negative inventory counting: subtract from outcome (make outcome less negative)
            adjustedOutcoming = originalOutcoming - inventoryCountingQty;
          }

          newData.push({
            batch_id: batch_id,
            batch_name: end_saldo[batch_id].batchName,
            feed_type_name: end_saldo[batch_id]?.feed_type_name,
            item_name: end_saldo[batch_id]?.itemName,
            start_saldo: start_saldo[batch_id]?.qty
              ? start_saldo[batch_id].qty
              : 0,
            incoming: adjustedIncoming,
            outcoming: adjustedOutcoming,
            end_saldo: end_saldo[batch_id]?.qty,
            inventory_counting_qty: inventoryCountingQty,
          });
        }
      }

      console.log("Setting data, length:", newData.length);
      setData(newData);
    } catch (error) {
      console.error("Error fetching batch data:", error);
      // Set empty data on error to prevent infinite loading
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    console.log(
      "useEffect triggered - startDate:",
      startDate,
      "endDate:",
      endDate,
      "refetchTrigger:",
      refetchTrigger
    );

    // Only fetch if we have valid dates
    if (startDate && endDate) {
      fetchData();
    } else {
      setLoading(false);
      setData([]);
    }
  }, [startDate, endDate, refetchTrigger, fetchData]);

  // Cleanup functionality moved to Inventory Counting module

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="flex justify-end w-full ">
        <Link
          href={`/leftovers/view`}
          className="py-2 w-40 text-center font-bold text-blue-500 hover:underline underline-offset-2"
        >
          Назад
        </Link>
      </div>
      <div>
        <div className="flex justify-between p-2 text-lg font-bold">
          <h1>Початок: {startDate}</h1>
          <div className="flex-1 flex justify-center">
            {/* Clear leftovers functionality removed - use Inventory Counting instead */}
          </div>
          <h1>Кінець: {endDate}</h1>
        </div>

        <LeftoversTable data={data} periodEndDate={endDate} />

        <ExportButton />
      </div>

      {/* Clear leftovers functionality removed - use Inventory Counting instead */}
    </div>
  );
}
