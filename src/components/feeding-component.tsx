"use client";

import { useFormState } from "react-dom";
import * as actions from "@/actions";
import PartitionForm from "@/components/batch-partition";
import { useState, useEffect, useRef } from "react";
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
  const {
    isOpen: isStockingOpen,
    onOpen: onStockingOpen,
    onClose: onStockingClose,
  } = useDisclosure();
  const { validateAndShowPopup } = usePoolValidation();

  const [formState, action] = useFormState(actions.stockPool, { message: "" });

  // Stocking form state
  const [selectedBatch, setSelectedBatch] = useState<string | undefined>(
    undefined
  );
  const [fishAmount, setFishAmount] = useState<number | undefined>(undefined);
  const [averageWeight, setAverageWeight] = useState<number | undefined>(
    undefined
  );
  const [stockingError, setStockingError] = useState<string>("");
  const [selectKey, setSelectKey] = useState<number>(0);

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
      // Reset form and error state when opening modal
      setSelectedBatch(undefined);
      setFishAmount(undefined);
      setAverageWeight(undefined);
      setStockingError("");
      setSelectKey((prev) => prev + 1);
      onStockingOpen();
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isStockingOpen) {
      setSelectedBatch(undefined);
      setFishAmount(undefined);
      setAverageWeight(undefined);
      setStockingError("");
      setSelectKey((prev) => prev + 1);
    }
  }, [isStockingOpen]);

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

      <div className="flex flex-wrap gap-4 justify-end">
        {(!poolInfo?.batch || poolInfo.qty == 0) && (
          <Button color="primary" onPress={handleStockFromWarehouseClick}>
            Зарибити зі складу
          </Button>
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

      {/* Stocking Modal */}
      <Modal
        isOpen={isStockingOpen}
        onClose={onStockingClose}
        placement="top-center"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h1>Зарибити зі складу</h1>
                <p>Локація: {location.name}</p>
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (!selectedBatch || !fishAmount || !averageWeight) {
                      return;
                    }

                    // Validate against available quantity
                    const selectedBatchData = batches.find(
                      (b) => b.id.toString() === selectedBatch
                    );
                    const availableQuantity =
                      selectedBatchData?.remainingQuantity || 0;

                    if (fishAmount > availableQuantity) {
                      setStockingError(
                        `Кількість перевищує доступну кількість (${availableQuantity} риб)`
                      );
                      return;
                    }

                    try {
                      setStockingError(""); // Clear any previous errors

                      const formData = new FormData();
                      formData.set("today", today);
                      formData.set("location_id_from", "87");
                      formData.set("location_id_to", location.id.toString());
                      formData.set("batch_id", selectedBatch);
                      formData.set("fish_amount", fishAmount.toString());
                      formData.set(
                        "average_fish_mass",
                        averageWeight.toString()
                      );

                      const result = await actions.stockPool(
                        undefined,
                        formData
                      );

                      if (result?.message) {
                        // Show error message in modal
                        setStockingError(result.message);
                      } else {
                        // Success - close modal and refresh
                        onClose();
                        setSelectedBatch(undefined);
                        setFishAmount(undefined);
                        setAverageWeight(undefined);
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error("Stocking error:", error);
                      setStockingError(
                        "Помилка при зарибленні. Спробуйте ще раз."
                      );
                    }
                  }}
                >
                  <div className="flex flex-col gap-4">
                    {/* Debug info */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
                        <div>
                          Debug: Всього партій: {batches.length}, Доступних:{" "}
                          {
                            batches.filter(
                              (batch) =>
                                batch.remainingQuantity &&
                                batch.remainingQuantity > 0
                            ).length
                          }
                        </div>
                        <div>Selected batch: {selectedBatch || "none"}</div>
                        <div>
                          Selected keys:{" "}
                          {selectedBatch
                            ? `Set([${selectedBatch}])`
                            : "empty Set"}
                        </div>
                        <div>
                          Selected batch name:{" "}
                          {selectedBatch
                            ? batches.find(
                                (b) => b.id.toString() === selectedBatch
                              )?.name || "Not found"
                            : "none"}
                        </div>
                        <div>
                          Keys match:{" "}
                          {selectedBatch &&
                          batches.some((b) => b.id.toString() === selectedBatch)
                            ? "✅"
                            : "❌"}
                        </div>
                        <div>Fish amount: {fishAmount || "none"}</div>
                        <div>Average weight: {averageWeight || "none"}</div>
                        <details>
                          <summary className="cursor-pointer">
                            Available batches
                          </summary>
                          <pre className="text-xs mt-1 max-h-32 overflow-y-auto">
                            {JSON.stringify(
                              batches
                                .filter(
                                  (batch) =>
                                    batch.remainingQuantity &&
                                    batch.remainingQuantity > 0
                                )
                                .map((b) => ({
                                  id: b.id.toString(),
                                  name: b.name,
                                  remainingQuantity: b.remainingQuantity,
                                })),
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      </div>
                    )}

                    {selectedBatch && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong>Вибрана партія:</strong>{" "}
                        {
                          batches.find((b) => b.id.toString() === selectedBatch)
                            ?.name
                        }
                        (Залишок:{" "}
                        {
                          batches.find((b) => b.id.toString() === selectedBatch)
                            ?.remainingQuantity
                        }
                        )
                      </div>
                    )}

                    {batches.filter(
                      (batch) =>
                        batch.remainingQuantity && batch.remainingQuantity > 0
                    ).length > 0 ? (
                      <Select
                        label="Партія риби *"
                        placeholder="Виберіть партію"
                        isRequired
                        onSelectionChange={(keys) => {
                          console.log("Raw keys received:", keys);
                          const keysArray = Array.from(keys);
                          const selectedKey = keysArray[0];
                          console.log("Selection changed:", {
                            keys: keysArray,
                            selectedKey,
                            keyType: typeof selectedKey,
                          });

                          if (selectedKey !== undefined) {
                            const batchId = String(selectedKey);
                            console.log("Setting selected batch:", batchId);
                            setSelectedBatch(batchId);
                          } else {
                            console.log("Clearing selection");
                            setSelectedBatch(undefined);
                          }
                        }}
                        defaultSelectedKeys={[]}
                        key={`select-reset-${selectKey}`}
                        variant="bordered"
                      >
                        {batches
                          .filter(
                            (batch) =>
                              batch.remainingQuantity &&
                              batch.remainingQuantity > 0
                          )
                          .map((batch) => (
                            <SelectItem
                              key={batch.id.toString()}
                              value={batch.id.toString()}
                            >
                              {batch.name} (Залишок: {batch.remainingQuantity})
                            </SelectItem>
                          ))}
                      </Select>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 text-sm">
                          Немає доступних партій риби на складі для зариблення.
                        </p>
                        {process.env.NODE_ENV === "development" && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs">
                              Debug info
                            </summary>
                            <pre className="text-xs mt-1">
                              {JSON.stringify(
                                batches.map((b) => ({
                                  id: b.id.toString(),
                                  name: b.name,
                                  remainingQuantity: b.remainingQuantity,
                                })),
                                null,
                                2
                              )}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    <Input
                      label="Кількість риби *"
                      placeholder="Введіть кількість"
                      type="number"
                      min={1}
                      max={
                        selectedBatch
                          ? batches.find(
                              (b) => b.id.toString() === selectedBatch
                            )?.remainingQuantity || undefined
                          : undefined
                      }
                      isRequired
                      onChange={(e) => setFishAmount(Number(e.target.value))}
                      description={
                        selectedBatch
                          ? `Доступно: ${
                              batches.find(
                                (b) => b.id.toString() === selectedBatch
                              )?.remainingQuantity || 0
                            } риб`
                          : "Спочатку виберіть партію"
                      }
                    />

                    <Input
                      label="Середня вага (г) *"
                      placeholder="Введіть середню вагу"
                      type="number"
                      min={0.1}
                      step="0.1"
                      isRequired
                      onChange={(e) => setAverageWeight(Number(e.target.value))}
                    />

                    {stockingError && (
                      <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
                        {stockingError}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button color="default" variant="light" onPress={onClose}>
                      Відмінити
                    </Button>
                    <Button
                      color="primary"
                      type="submit"
                      isDisabled={
                        !selectedBatch ||
                        !fishAmount ||
                        !averageWeight ||
                        batches.filter(
                          (batch) =>
                            batch.remainingQuantity &&
                            batch.remainingQuantity > 0
                        ).length === 0
                      }
                    >
                      Зарибити
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
