"use client";
import React, { useState, useEffect } from "react";
import { calculationAndFeedExtended } from "@/types/app_types";
import PriorityForm from "@/components/DailyFeedWeight/priority-form";
import PercentFeedingForm from "@/components/DailyFeedWeight/percent-feeding-form";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { getPercentFeedingForDate, getPriorityForDate } from "@/utils/periodic";

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: { [time: string]: { feeding?: string; editing?: string } };
  hasDocument?: boolean;
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
  percentFeeding?: number;
}

type Row =
  | {
      location?: {
        id: number;
        name: string;
        percent_feeding?: number;
      };
      rows?: subRow[];
    }
  | FeedingInfo
  | undefined;

export type LocationComponentProps = {
  row: Row;
  items: {
    id: number;
    name: string;
    feedtypes: {
      id: number;
      name: string;
    } | null;
  }[];
  date: string;
};

type subRow = {
  qty?: number;
  feed: {
    id?: number;
    name?: string;
  };
  item: {
    id?: number;
    name?: string;
  };
};

function isFeedingInfo(row: Row): row is FeedingInfo {
  return (
    row !== undefined &&
    (row as FeedingInfo).locId !== undefined &&
    (row as FeedingInfo).locName !== undefined
  );
}

function isOldRow(row: Row): row is {
  location?: { id: number; name: string; percent_feeding?: number };
  rows?: subRow[];
} {
  return row !== undefined && (row as any).location !== undefined;
}

export type LocationComponentPropsWithPercent = LocationComponentProps & {
  percentFeeding: number;
};

export default function LocationComponent({
  row,
  items,
  date,
  percentFeeding,
}: LocationComponentPropsWithPercent) {
  // console.log(row?.location?.name)
  // row?.rows?.map(row =>
  //     console.log(row.item)
  // )

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

  const [openLocationIndex, setOpenLocationIndex] = useState<number | null>(
    null
  );

  const [openFeedingIndex, setOpenFeedingIndex] = useState<{
    idx: number;
    feedTypeId?: number;
    modalKey: number;
  } | null>(null);

  const [openPercentModal, setOpenPercentModal] = useState<boolean>(false);

  const [openPriorityIndex, setOpenPriorityIndex] = useState<number | null>(
    null
  );

  const [openPriorityFeedIdx, setOpenPriorityFeedIdx] = useState<number | null>(
    null
  );

  const handleOpen = (index: number) => {
    setOpenItemIndex(index);
  };

  const handleClose = () => {
    setOpenItemIndex(null);
  };
  const handleOpenPercent = (index?: number) => {
    if (index) setOpenLocationIndex(index);
  };

  const handleClosePercent = () => {
    setOpenLocationIndex(null);
  };

  return (
    <>
      {isOldRow(row) && (
        <React.Fragment key={row.location?.id}>
          <tr>
            <td
              className="px-4 h-10 border border-gray-400"
              rowSpan={Number(row.rows?.length) + 1}
            >
              {row.location?.name}
            </td>
            <td
              className="px-4 h-10 border border-gray-400 text-center"
              rowSpan={Number(row.rows?.length) + 1}
            >
              {percentFeeding === 0 || percentFeeding == null
                ? ""
                : percentFeeding}
            </td>
            <td
              className="px-4 h-10 border border-gray-400"
              rowSpan={Number(row.rows?.length) + 1}
              onClick={() =>
                handleOpenPercent(
                  row.location?.id === null ? 0 : row.location?.id
                )
              }
            >
              &nbsp;
              {percentFeeding === 0 ? "" : percentFeeding}
              &nbsp;
              {openLocationIndex != null && (
                <Modal
                  isOpen={true}
                  onClose={handleClosePercent}
                  placement="top-center"
                >
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-col gap-1">
                          % відхилення
                        </ModalHeader>
                        <ModalBody>
                          <PercentFeedingForm location={row.location} />
                        </ModalBody>
                        <ModalFooter>
                          {/* Можливо, ви хочете додати додаткові дії */}
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              )}
            </td>
          </tr>
          {row.rows?.map((item, itemIndex) => {
            let rqty: number =
              item.qty === null || item.qty === undefined ? 0 : item.qty;
            let feed_: number =
              percentFeeding === null || percentFeeding === undefined
                ? 0
                : percentFeeding;
            let adjustedFeeding = "";
            if (rqty * (1 + feed_ / 100) !== 0 && !isNaN(feed_)) {
              adjustedFeeding = (rqty * (1 + feed_ / 100)).toFixed(2);
            }
            return (
              <tr key={itemIndex}>
                <td className="px-4 h-10 border border-gray-400 text-right">
                  {rqty.toFixed(2)}
                </td>
                <td className="px-4 h-10 border border-gray-400 text-right">
                  {adjustedFeeding}
                </td>
                <td className="px-4 h-10 border border-gray-400">
                  W
                  <button
                    type="button"
                    className="underline text-blue-700 hover:text-blue-900 focus:outline-none"
                    tabIndex={0}
                    title={`Змінити пріоритет для ${item.feed.name}`}
                    aria-label={`Змінити пріоритет для ${item.feed.name}`}
                    onClick={() => {
                      console.log(
                        "Clicked feed name:",
                        item.feed.name,
                        "at index",
                        itemIndex
                      );
                      setOpenPriorityIndex(itemIndex);
                    }}
                  >
                    {item.feed.name}
                  </button>
                  {openPriorityIndex === itemIndex && (
                    <Modal
                      isOpen={true}
                      onClose={() => setOpenPriorityIndex(null)}
                      placement="top-center"
                    >
                      <ModalContent>
                        {(onClose) => (
                          <PriorityForm
                            location={row.location}
                            items={items}
                            item={item}
                            date={date}
                          />
                        )}
                      </ModalContent>
                    </Modal>
                  )}
                </td>
                <td className="px-4 h-10 border border-gray-400">
                  <button color="default">{item.item.name}</button>
                </td>
              </tr>
            );
          })}
        </React.Fragment>
      )}
      {isFeedingInfo(row) && (
        <React.Fragment key={row.locId}>
          {(() => {
            const filteredFeedings = (row.feedings ?? []).filter((feeding) => {
              let firstFeeding = "";
              if (feeding.feedings) {
                const first = Object.values(feeding.feedings).find(
                  (f) =>
                    f.feeding !== undefined &&
                    f.feeding !== null &&
                    f.feeding !== ""
                );
                if (first && first.feeding)
                  firstFeeding = parseFloat(first.feeding).toFixed(2);
              }
              return parseFloat(firstFeeding) !== 0;
            });
            const allFeedingsUnfed = filteredFeedings.every(
              (feeding) =>
                feeding.feedings &&
                Object.values(feeding.feedings).every((f) =>
                  Boolean(
                    f && "hasDocument" in f && (f as any).hasDocument === false
                  )
                )
            );
            return filteredFeedings.map((feeding, idx) => {
              let firstFeeding = "";
              if (feeding.feedings) {
                const first = Object.values(feeding.feedings).find(
                  (f) =>
                    f.feeding !== undefined &&
                    f.feeding !== null &&
                    f.feeding !== ""
                );
                if (first && first.feeding)
                  firstFeeding = parseFloat(first.feeding).toFixed(2);
              }
              let adjustedFeeding = "";
              if (firstFeeding !== "" && !isNaN(percentFeeding)) {
                adjustedFeeding = (
                  parseFloat(firstFeeding) *
                  (1 + percentFeeding / 100)
                ).toFixed(2);
              }
              return (
                <tr key={idx}>
                  {idx === 0 && (
                    <>
                      <td
                        className="px-4 h-10 border border-gray-400"
                        rowSpan={filteredFeedings.length}
                      >
                        {row.locName}
                      </td>
                      <td
                        className={
                          allFeedingsUnfed
                            ? "px-4 h-10 border border-gray-400 text-center cursor-pointer hover:underline"
                            : "px-4 h-10 border border-gray-400 text-center"
                        }
                        rowSpan={filteredFeedings.length}
                        onClick={
                          allFeedingsUnfed
                            ? () => setOpenPercentModal(true)
                            : undefined
                        }
                        style={
                          allFeedingsUnfed
                            ? { color: "#2563eb", textDecoration: "underline" }
                            : {}
                        }
                      >
                        {percentFeeding === 0 ? "" : percentFeeding}
                        {openPercentModal && allFeedingsUnfed && (
                          <Modal
                            isOpen={true}
                            onClose={() => setOpenPercentModal(false)}
                            placement="top-center"
                          >
                            <ModalContent>
                              {(onClose) => (
                                <PercentFeedingForm
                                  location={{
                                    id: row.locId,
                                    name: row.locName,
                                    percentFeeding: percentFeeding,
                                  }}
                                  date={date}
                                />
                              )}
                            </ModalContent>
                          </Modal>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-4 h-10 border border-gray-400">
                    {feeding.feedType}
                  </td>
                  <td className="px-4 h-10 border border-gray-400">
                    {(() => {
                      const allTimeSlotsUnfed =
                        feeding.feedings &&
                        Object.values(feeding.feedings).every((f) =>
                          Boolean(
                            f &&
                              "hasDocument" in f &&
                              (f as any).hasDocument === false
                          )
                        );
                      if (allTimeSlotsUnfed) {
                        return (
                          <>
                            <button
                              type="button"
                              className="underline text-blue-700 hover:text-blue-900 focus:outline-none"
                              tabIndex={0}
                              title={`Змінити пріоритет для ${feeding.feedName}`}
                              aria-label={`Змінити пріоритет для ${feeding.feedName}`}
                              onClick={() => {
                                setOpenPriorityFeedIdx(idx);
                                console.log(
                                  "Clicked feed name:",
                                  feeding.feedName,
                                  "at index",
                                  idx
                                );
                              }}
                            >
                              {feeding.feedName}
                            </button>
                            {openPriorityFeedIdx === idx &&
                              allTimeSlotsUnfed && (
                                <Modal
                                  isOpen={true}
                                  onClose={() => setOpenPriorityFeedIdx(null)}
                                  placement="top-center"
                                >
                                  <ModalContent>
                                    {(onClose) => (
                                      <PriorityForm
                                        location={{
                                          id: row.locId,
                                          name: row.locName,
                                        }}
                                        items={items}
                                        item={{
                                          feed: {
                                            id: feeding.feedId,
                                            name: feeding.feedName,
                                          },
                                          item: {},
                                        }}
                                        date={date}
                                        onSuccess={() =>
                                          setOpenPriorityFeedIdx(null)
                                        }
                                      />
                                    )}
                                  </ModalContent>
                                </Modal>
                              )}
                          </>
                        );
                      } else {
                        return feeding.feedName;
                      }
                    })()}
                  </td>
                  <td className="px-4 h-10 border border-gray-400 text-right">
                    {firstFeeding}
                  </td>
                  <td className="px-4 h-10 border border-gray-400 text-right">
                    {adjustedFeeding}
                  </td>
                </tr>
              );
            });
          })()}
        </React.Fragment>
      )}
    </>
  );
}
