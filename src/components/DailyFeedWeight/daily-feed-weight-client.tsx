"use client";
import LocationComponent from "@/components/DailyFeedWeight/location-info";
import PriorityForm from "@/components/DailyFeedWeight/priority-form";
import PercentFeedingForm from "@/components/DailyFeedWeight/percent-feeding-form";
import { Modal, ModalContent } from "@nextui-org/react";
import React, { useState } from "react";

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

interface FeedingInfo {
  date: string;
  locId: number;
  locName: string;
  rowCount?: number;
  feedings?: Feeding[];
  batch?: {
    id: number;
    name: string;
  };
}

interface DailyFeedWeightClientProps {
  groupedData: FeedingInfo[];
  items: {
    id: number;
    name: string;
    feedtypes: {
      id: number;
      name: string;
    } | null;
  }[];
  date: string;
  percentFeedingMap: Record<number, number>;
  aggregatedData: { [key: string]: number };
}

export default function DailyFeedWeightClient({
  groupedData,
  items,
  date,
  percentFeedingMap,
  aggregatedData,
}: DailyFeedWeightClientProps) {
  const [openPriority, setOpenPriority] = useState<null | {
    itemName: string;
    qty: number;
  }>(null);
  const [openPercent, setOpenPercent] = useState<null | {
    locationName: string;
    locationId: number;
    percent: number | null;
  }>(null);

  return (
    <>
      <div className="flex justify-between my-4 mx-8">
        <h1 className="text-lg font-bold">Наважка на 1 годування</h1>
        <h1 className="text-lg font-bold">Зведена таблиця</h1>
      </div>

      <div className="flex justify-around min-h-screen content-start">
        <table className="w-5/7 bg-white rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-4">Басейн</th>
              <th className="border p-4">% відх.</th>
              <th className="border p-4">Калк. к-сть, г</th>
              <th className="border p-4">Розр. к-сть, г</th>
              <th className="border p-4">Тип корму</th>
              <th className="border p-4">Корм</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.map((row) =>
              row.feedings && row.feedings.length > 0 ? (
                <LocationComponent
                  key={row.locId}
                  row={row}
                  items={items}
                  date={date}
                  percentFeeding={percentFeedingMap[row.locId] ?? 0}
                />
              ) : null
            )}
          </tbody>
        </table>

        <table className="w-2/9 bg-white rounded-lg shadow-lg self-start">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-4">Корм</th>
              <th className="border p-4">Кількість</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(aggregatedData).map(([itemName, qty]) => (
              <tr key={itemName}>
                <td
                  className="px-4 h-10 border border-gray-400 cursor-pointer hover:underline"
                  onClick={() => setOpenPriority({ itemName, qty })}
                >
                  {itemName}
                </td>
                <td className="px-4 h-10 border border-gray-400  text-right">
                  {qty.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* PriorityForm Modal */}
      <Modal
        isOpen={!!openPriority}
        onClose={() => setOpenPriority(null)}
        placement="top-center"
      >
        <ModalContent>
          {() =>
            openPriority && (
              <PriorityForm
                location={undefined}
                items={items}
                item={{
                  qty: openPriority.qty,
                  feed: { name: openPriority.itemName },
                  item: { name: openPriority.itemName },
                }}
              />
            )
          }
        </ModalContent>
      </Modal>
      {/* PercentFeedingForm Modal (for summary table, you may want to add a clickable cell for percent if you show it) */}
      {/* Example: <td onClick={() => setOpenPercent({ locationName, locationId, percent })}>...</td> */}
      {/* <Modal isOpen={!!openPercent} onClose={() => setOpenPercent(null)} placement="top-center">
        <ModalContent>
          {() =>
            openPercent && (
              <PercentFeedingForm
                location={{
                  id: openPercent.locationId,
                  name: openPercent.locationName,
                  percent_feeding: openPercent.percent,
                }}
              />
            )
          }
        </ModalContent>
      </Modal> */}
    </>
  );
}
