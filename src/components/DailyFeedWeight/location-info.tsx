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

type Row =
  | {
      location?: {
        id: number;
        name: string;
        percent_feeding?: number;
      };
      rows?: subRow[];
    }
  | undefined;

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
    <React.Fragment key={row?.location?.id}>
      <tr>
        <td
          className="px-4 h-10 border border-gray-400"
          rowSpan={Number(row?.rows?.length) + 1}
        >
          {row?.location?.name}
        </td>
        <td
          className="px-4 h-10 border border-gray-400"
          rowSpan={Number(row?.rows?.length) + 1}
          onClick={() =>
            handleOpenPercent(
              row?.location?.id === null ? 0 : row?.location?.id
            )
          }
        >
          &nbsp;
          {row?.location?.percent_feeding === 0
            ? ""
            : row?.location?.percent_feeding}
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
                      <PercentFeedingForm location={row?.location} />
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
      {row?.rows?.map((item, itemIndex) => {
        let rqty: number =
          item.qty === null || item.qty === undefined ? 0 : item.qty;
        let feed_: number =
          row?.location?.percent_feeding === null ||
          row?.location?.percent_feeding === undefined
            ? 0
            : row?.location?.percent_feeding;
        return (
          <tr key={itemIndex}>
            <td className="px-4 h-10 border border-gray-400 text-right">
              {rqty.toFixed(2)}
            </td>
            <td className="px-4 h-10 border border-gray-400 text-right">
              {(rqty * (1 + feed_ / 100)).toFixed(2)}
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
  );
}
