"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import * as actions from "@/actions";
import LeftoversTable from "@/components/leftovers-table";
import ExportButton from "@/components/leftoversTableToPrint";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { cleanupLeftovers } from "@/actions/crutial/cleanupLeftovers";

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
}

export default function LeftoversPerPeriod(props: LeftoversPerPeriodProps) {
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
          newData.push({
            batch_id: batch_id,
            batch_name: end_saldo[batch_id].batchName,
            feed_type_name: end_saldo[batch_id]?.feed_type_name,
            item_name: end_saldo[batch_id]?.itemName,
            start_saldo: start_saldo[batch_id]?.qty
              ? start_saldo[batch_id].qty
              : 0,
            incoming: incoming[batch_id]?.qty ? incoming[batch_id].qty : 0,
            outcoming: outcoming[batch_id]?.qty ? outcoming[batch_id].qty : 0,
            end_saldo: end_saldo[batch_id]?.qty,
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

  const handleSelectionChange = (item: DataItem | null) => {
    setSelectedItem(item);
  };

  const handleCleanup = async () => {
    if (!selectedItem || !endDate) return;

    setIsCleaning(true);
    try {
      const formData = new FormData();
      formData.append("batch_id", selectedItem.batch_id);
      formData.append("cleanup_date", endDate);

      const result = await cleanupLeftovers(undefined, formData);

      if (result?.message) {
        alert(result.message);
        setSelectedItem(null);
        onClose();
        // Add a small delay before refetching to ensure transaction is processed
        setTimeout(() => {
          setRefetchTrigger((prev) => prev + 1);
        }, 500);
      }
    } catch (error) {
      console.error("Cleanup error:", error);
      alert("Помилка при очищенні залишків");
    } finally {
      setIsCleaning(false);
    }
  };

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
            {selectedItem && (
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600">
                  Вибрано рядок: {selectedItem.batch_name} -{" "}
                  {selectedItem.item_name} (ID: {selectedItem.batch_id})
                </div>
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  onPress={onOpen}
                  className="mt-1"
                >
                  Очистити залишки
                </Button>
              </div>
            )}
          </div>
          <h1>Кінець: {endDate}</h1>
        </div>

        <LeftoversTable
          data={data}
          periodEndDate={endDate}
          onSelectionChange={handleSelectionChange}
        />

        <ExportButton />
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Підтвердження очищення</ModalHeader>
          <ModalBody>
            {selectedItem && (
              <div>
                <p>Ви дійсно хочете очистити залишки для:</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <strong>Партія:</strong> {selectedItem.batch_name}
                  </li>
                  <li>
                    <strong>Корм:</strong> {selectedItem.item_name}
                  </li>
                  <li>
                    <strong>Кількість для очищення:</strong> Фактична кількість
                    на складі (location 87)
                  </li>
                  <li>
                    <strong>Дата очищення:</strong> {endDate}
                  </li>
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Ця операція створить документ списання та зменшить кількість
                  на складі до нуля.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Скасувати
            </Button>
            <Button
              color="danger"
              onPress={handleCleanup}
              isLoading={isCleaning}
            >
              Очистити
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
