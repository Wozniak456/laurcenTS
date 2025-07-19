"use client";

import { useFormState } from "react-dom";
import * as actions from "@/actions";
import PartitionForm from "@/components/batch-partition";
import { useState, useEffect } from "react";
import { itembatches } from "@prisma/client";
import PoolInfo from "@/components/Pools/pool-info";
import { disposalItem, poolManagingType } from "@/types/app_types";
import DisposalForm from "@/components/Stocking/disposal-form";
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
import FormButton from "./common/form-button";
import FetchingForm from "./fetching";
import { usePoolValidation } from "@/utils/poolValidation";

import Link from "next/link";

interface StockPoolProps {
  areaId: number;
  locations: {
    id: number;
    name: string;
    location_type_id: number;
  }[];
  location: {
    id: number;
    location_type_id: number;
    name: string;
    pool_id: number | null;
  };
  batches: {
    id: bigint;
    name: string;
    items: {
      id: number;
      name: string;
    };
    remainingQuantity?: number;
  }[];
  poolInfo: poolManagingType | undefined;
  disposal_reasons: disposalItem[];
  weekNum: number;
  today: string;
}

export default function StockPoolPage({
  areaId,
  location,
  locations,
  batches,
  poolInfo,
  disposal_reasons,
  weekNum,
  today,
}: StockPoolProps) {
  const [showPartitionForm, setShowPartitionForm] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { validateAndShowPopup } = usePoolValidation();

  const [formState, action] = useFormState(actions.stockPool, { message: "" });

  // Reset the partition form when the component mounts or when pool data changes
  useEffect(() => {
    setShowPartitionForm(false);
  }, [poolInfo?.qty, poolInfo?.batch?.id, today]);

  // Handle Stock from Warehouse button click with validation
  const handleStockFromWarehouseClick = async () => {
    const isAllowed = await validateAndShowPopup(
      location.id,
      today,
      "stocking"
    );
    if (isAllowed) {
      // The form will submit normally since validation passed
      return true;
    }
    return false;
  };

  // Handle Split button click with validation
  const handleSplitClick = async () => {
    if (poolInfo?.qty && poolInfo.qty > 0) {
      const isAllowed = await validateAndShowPopup(location.id, today, "split");
      if (isAllowed) {
        setShowPartitionForm(!showPartitionForm);
      }
    }
  };

  // Handle Disposal button click with validation
  const handleDisposalClick = async () => {
    if (poolInfo?.qty && poolInfo.qty > 0) {
      const isAllowed = await validateAndShowPopup(
        location.id,
        today,
        "disposal"
      );
      if (isAllowed) {
        onOpen();
      }
    }
  };

  // Handle Update Pool State link click with validation
  const handleUpdatePoolStateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isAllowed = await validateAndShowPopup(location.id, today, "update");
    if (isAllowed) {
      // Navigate to the update page
      window.location.href = `/pool-managing/day/${today}/${location.id}`;
    }
  };

  return (
    <div>
      <div className="my-4">
        <h2 className="font-bold">Локація: {location.name}</h2>
      </div>

      {poolInfo?.qty && poolInfo.qty > 0 ? (
        <PoolInfo
          areaId={areaId}
          location={location}
          poolInfo={poolInfo}
          batches={batches}
          today={today}
        />
      ) : (
        ""
      )}

      <form action={action} onSubmit={handleStockFromWarehouseClick}>
        <input type="hidden" name="today" value={today} />
        <input type="hidden" name="location_id_from" value={87} />
        <input type="hidden" name="location_id_to" value={location.id} />

        <div className="flex flex-wrap gap-4 justify-end">
          {(!poolInfo?.batch || poolInfo.qty == 0) && (
            <FormButton color="primary">Зарибити зі складу</FormButton>
          )}

          {poolInfo?.qty && poolInfo.qty > 0 ? (
            <>
              <Button color="primary" onClick={handleSplitClick}>
                Розділити
              </Button>

              <Button onPress={handleDisposalClick} color="default">
                Списати
              </Button>
              <Modal
                isOpen={isOpen}
                // onOpenChange={onOpenChange}
                onClose={onClose}
                placement="top-center"
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Списання
                      </ModalHeader>
                      <ModalBody>
                        <DisposalForm
                          location={location}
                          poolInfo={poolInfo}
                          reasons={disposal_reasons}
                          today={today}
                        />
                      </ModalBody>
                      <ModalFooter></ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </>
          ) : (
            ""
          )}
        </div>

        {formState && formState.message && (
          <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
            {formState.message}
          </div>
        )}
      </form>

      {poolInfo?.qty && poolInfo.qty > 0 && (
        <div className="flex justify-end mb-4">
          <a
            href={`/pool-managing/day/${today}/${location.id}`}
            onClick={handleUpdatePoolStateClick}
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Актуалізація стану басейна
          </a>
        </div>
      )}

      {poolInfo?.qty && poolInfo.qty > 0 && (
        <div className="flex justify-end mb-4">
          <FetchingForm
            location={location}
            poolInfo={poolInfo}
            locations={locations}
            weekNum={weekNum}
            today={today}
          />
        </div>
      )}

      {showPartitionForm && (
        <PartitionForm
          location={location}
          poolInfo={poolInfo}
          locations={locations}
          today={today}
        />
      )}
    </div>
  );
}
