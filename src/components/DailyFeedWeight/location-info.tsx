"use client";
import React, { useState } from "react";
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
  percentFeeding?: number;
  percent_feeding?: number;
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

export default function LocationComponent({
  row,
  items,
}: LocationComponentProps) {
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
              {row.location?.percent_feeding === 0 ||
              row.location?.percent_feeding == null
                ? ""
                : row.location?.percent_feeding}
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
              {row.location?.percent_feeding === 0
                ? ""
                : row.location?.percent_feeding}
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
              row.location?.percent_feeding === null ||
              row.location?.percent_feeding === undefined
                ? 0
                : row.location?.percent_feeding;
            let percent = isFeedingInfo(row)
              ? row.percentFeeding ?? row.percent_feeding ?? 0
              : 0;
            let adjustedFeeding = "";
            if (rqty * (1 + feed_ / 100) !== 0 && !isNaN(percent)) {
              adjustedFeeding = (
                rqty *
                (1 + feed_ / 100) *
                (1 + percent / 100)
              ).toFixed(2);
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
                  {item.feed.name}
                </td>
                <td className="px-4 h-10 border border-gray-400">
                  <button onClick={() => handleOpen(itemIndex)} color="default">
                    {item.item.name}
                  </button>
                  {openItemIndex === itemIndex && (
                    <Modal
                      isOpen={true}
                      onClose={handleClose}
                      placement="top-center"
                    >
                      <ModalContent>
                        {(onClose) => (
                          <>
                            <ModalHeader className="flex flex-col gap-1">
                              Вибір корму
                            </ModalHeader>
                            <ModalBody>
                              <PriorityForm
                                location={row.location}
                                items={items}
                                item={item}
                              />
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
            );
          })}
        </React.Fragment>
      )}
      {isFeedingInfo(row) && (
        <React.Fragment key={row.locId}>
          {row.feedings?.map((feeding, idx) => {
            // Show only the first available feeding weight for this feeding type
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
            let percent =
              (row as FeedingInfo).percentFeeding ??
              (row as FeedingInfo).percent_feeding ??
              0;
            let adjustedFeeding = "";
            if (firstFeeding !== "" && !isNaN(percent)) {
              adjustedFeeding = (
                parseFloat(firstFeeding) *
                (1 + percent / 100)
              ).toFixed(2);
            }
            return (
              <tr key={idx}>
                {idx === 0 && (
                  <>
                    <td
                      className="px-4 h-10 border border-gray-400"
                      rowSpan={row.feedings?.length}
                    >
                      {row.locName}
                    </td>
                    <td
                      className="px-4 h-10 border border-gray-400 text-center cursor-pointer hover:underline"
                      rowSpan={row.feedings?.length}
                      onClick={() => setOpenPercentModal(true)}
                    >
                      {(row.percentFeeding ?? row.percent_feeding) === 0 ||
                      (row.percentFeeding == null &&
                        row.percent_feeding == null)
                        ? ""
                        : row.percentFeeding ?? row.percent_feeding}
                      {openPercentModal && (
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
                                  percent_feeding:
                                    row.percentFeeding ?? row.percent_feeding,
                                }}
                              />
                            )}
                          </ModalContent>
                        </Modal>
                      )}
                    </td>
                  </>
                )}
                <td className="px-4 h-10 border border-gray-400 text-right">
                  {firstFeeding}
                </td>
                <td className="px-4 h-10 border border-gray-400 text-right">
                  {adjustedFeeding}
                </td>
                <td className="px-4 h-10 border border-gray-400">
                  {feeding.feedType}
                </td>
                <td className="px-4 h-10 border border-gray-400">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      // Save scroll position before opening modal
                      sessionStorage.setItem(
                        "scrollY",
                        window.scrollY.toString()
                      );
                      // Find feed type id from items by matching feedType name
                      const feedTypeId = items.find(
                        (item) => item.feedtypes?.name === feeding.feedType
                      )?.feedtypes?.id;
                      setOpenFeedingIndex({
                        idx,
                        feedTypeId,
                        modalKey: Date.now(),
                      });
                    }}
                  >
                    {feeding.feedName}
                  </span>
                  {openFeedingIndex && openFeedingIndex.idx === idx && (
                    <Modal
                      key={openFeedingIndex.modalKey}
                      isOpen={true}
                      onClose={() => setOpenFeedingIndex(null)}
                      placement="top-center"
                    >
                      <ModalContent>
                        {(onClose) => (
                          <PriorityForm
                            key={openFeedingIndex.modalKey}
                            location={{ id: row.locId, name: row.locName }}
                            items={items}
                            item={{
                              feed: {
                                id: openFeedingIndex.feedTypeId,
                                name: feeding.feedType,
                              },
                              item: {
                                id: feeding.feedId,
                                name: feeding.feedName,
                              },
                            }}
                            onSuccess={() => setOpenFeedingIndex(null)}
                          />
                        )}
                      </ModalContent>
                    </Modal>
                  )}
                </td>
              </tr>
            );
          })}
        </React.Fragment>
      )}
    </>
  );
}
