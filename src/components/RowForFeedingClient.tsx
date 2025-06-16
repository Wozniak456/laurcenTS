"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import copyButton from "../../public/icons/typcn_arrow-right-outline.svg";
import feedButton from "../../public/icons/typcn_arrow-up-outline.svg";
import SuccessButton from "../../public/icons/SuccessFeeding.svg";
import CrossButton from "../../public/icons/UnsuccessfulFeeding.svg";
import cancelIcon from "../../public/icons/cancel-icon.svg";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { fetchFeedingRow, checkStockBeforeFeed } from "@/actions/feeding";
import { checkLaterTransactions } from "@/actions/crutial/cancelFeeding";

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: {
    [time: string]: {
      feeding?: string;
      editing?: string;
      hasDocument?: boolean;
    };
  };
}

interface TimeSlot {
  id: number;
  time: string;
}

interface Batch {
  id: number;
  name: string;
}

interface LocationInfo {
  id: number;
  name: string;
}

interface RowForFeedingClientProps {
  locInfo: LocationInfo;
  rowData: Feeding;
  times: TimeSlot[];
  rowCount?: number;
  today: string;
  batch?: Batch;
  onRowUpdate?: (locId: number, feedId: number, newFeedings: any) => void;
  allLocationFeedings?: Feeding[];
  percentFeeding: number;
  showForm?: boolean;
  setShowForm?: (show: boolean) => void;
  formState?: { message?: string };
  action?: (formData: FormData) => Promise<any>;
  cancelAction?: (locId: number, date: string, feedId: number) => Promise<any>;
}

export default function RowForFeedingClient(props: RowForFeedingClientProps) {
  const {
    locInfo,
    rowData,
    times,
    rowCount,
    today,
    batch,
    onRowUpdate,
    allLocationFeedings = [],
    percentFeeding,
    showForm,
    setShowForm,
    formState,
    action,
    cancelAction,
  } = props;

  const [localFeedings, setLocalFeedings] = useState(rowData.feedings || {});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [buttonMode, setButtonMode] = useState(false);
  const [editingValue, setEditingValue] = useState<{ [key: string]: string }>(
    {}
  );

  // Ref to the form element for programmatic submission
  const formRef = React.useRef<HTMLFormElement>(null);
  const cancelFormRef = React.useRef<HTMLFormElement>(null);
  const [canceling, setCanceling] = useState(false);

  // Store the initial feedings for restoring after cancel
  const initialFeedings = React.useRef(rowData.feedings);
  // Store the initial planned feedings for restoring after cancel
  const plannedFeedingsRef = React.useRef(rowData.feedings);

  // Helper to check if a value has the hasDocument property
  function hasHasDocument(obj: any): obj is { hasDocument: boolean } {
    return obj && typeof obj === "object" && "hasDocument" in obj;
  }

  // Determine if any feeding slot is actually fed
  const isFed =
    rowData.feedings &&
    Object.values(rowData.feedings).some(
      (f) => hasHasDocument(f) && f.hasDocument
    );
  const [fedState, setFedState] = useState(isFed);

  // Add a check for planned feedings
  const hasPlannedFeedings =
    rowData.feedings && Object.keys(rowData.feedings).length > 0;

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showNewerTxModal, setShowNewerTxModal] = useState(false);
  const [showFeedNewerTxModal, setShowFeedNewerTxModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (formState?.message) {
      if (formState.message.includes("Not enough stock")) {
        setErrorMessage(formState.message);
      } else {
        setErrorMessage(null);
      }
    }
  }, [formState]);

  const handleInputChange = (time: string, poolId: number, target: string) => {
    setEditingValue((prev) => ({
      ...prev,
      [`${poolId}-${time}`]: target,
    }));
    if (errorMessage) setErrorMessage(""); // Clear error on edit
  };

  const copyValueToAllInputs = (currentTime: string) => {
    const currentTimeKey = `${locInfo.id}-${parseInt(
      currentTime.split(":")[0]
    )}`;
    const valueToSpread = editingValue[currentTimeKey];
    if (!valueToSpread) return;
    const newEditingValues = { ...editingValue };
    const currentTimeIndex = times.findIndex(
      (t) =>
        parseInt(t.time.split(":")[0]) === parseInt(currentTime.split(":")[0])
    );
    times.slice(currentTimeIndex + 1).forEach((t) => {
      const timeKey = `${locInfo.id}-${parseInt(t.time.split(":")[0])}`;
      newEditingValues[timeKey] = valueToSpread;
    });
    setEditingValue(newEditingValues);
  };

  // Handle form submit with modal/progress
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setShowModal(true);
    setButtonMode(true);
    let result = undefined;
    if (action) {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      result = await action(formData);
      // Check for stock error immediately (handle both possible error messages)
      if (
        result?.message &&
        (result.message.includes("Not enough stock") ||
          result.message.includes("Not enough feed") ||
          result.message.includes("Немає достатньо корму"))
      ) {
        setErrorMessage(result.message);
        setIsLoading(false);
        setShowModal(false);
        setButtonMode(false);
        return; // Do not proceed
      }
    }
    setIsLoading(false);
    setShowModal(false);
    setButtonMode(false);
    setFedState(true);
    if (setShowForm) {
      setShowForm(false);
    }
    // Build updated feedings object with editing values and hasDocument true
    const updatedFeedings = { ...rowData.feedings };
    times.forEach((time) => {
      const feedingTime = parseInt(time.time.split(":")[0]);
      const key = `${locInfo.id}-${feedingTime}`;
      const value =
        editingValue[key] ?? (updatedFeedings[feedingTime]?.feeding || "");
      if (updatedFeedings[feedingTime]) {
        updatedFeedings[feedingTime] = {
          ...updatedFeedings[feedingTime],
          editing: value,
          hasDocument: true,
        };
      }
    });
    if (onRowUpdate && typeof rowData.feedId === "number") {
      onRowUpdate(locInfo.id, rowData.feedId, updatedFeedings);
    }
  };

  // When showForm becomes true, auto-submit the form, but only if there is no error and stock is sufficient
  useEffect(() => {
    const tryAutoSubmit = async () => {
      if (showForm && formRef.current && !errorMessage && rowData.feedId) {
        // Precheck for newer transactions before feeding
        const canFeed = await checkLaterTransactions(
          locInfo.id,
          today,
          rowData.feedId
        );
        if (!canFeed) {
          setShowFeedNewerTxModal(true);
          return;
        }
        // Gather planned quantities for all time slots
        const plannedQuantities: Record<string, number> = {};
        times.forEach((time) => {
          const feedingTime = parseInt(time.time.split(":")[0]);
          const key = `${locInfo.id}-${feedingTime}`;
          // Use editingValue if present, else calculatedQuantity
          let value = editingValue[key];
          if (value === undefined || value === null || value === "") {
            // fallback to calculatedQuantity
            const feedingData = rowData.feedings?.[feedingTime];
            const baseQuantity = feedingData?.feeding;
            value = baseQuantity
              ? (parseFloat(baseQuantity) * (1 + percentFeeding / 100)).toFixed(
                  2
                )
              : "0";
          }
          plannedQuantities[`time_${feedingTime}`] = parseFloat(value) || 0;
        });
        // Pre-submit stock check
        const result = await checkStockBeforeFeed({
          location_id: locInfo.id,
          item_id: rowData.feedId,
          date: today,
          quantities: plannedQuantities,
        });
        if (result.ok) {
          formRef.current.requestSubmit();
        } else {
          setErrorMessage(result.message || "Unknown error");
        }
      }
    };
    tryAutoSubmit();
  }, [
    showForm,
    errorMessage,
    rowData.feedId,
    locInfo.id,
    today,
    times,
    editingValue,
    percentFeeding,
  ]);

  // Reset local state when rowData or rowData.feedings changes (after parent update)
  useEffect(() => {
    setFedState(
      rowData.feedings &&
        Object.values(rowData.feedings).some(
          (f) => hasHasDocument(f) && f.hasDocument
        )
    );
    setLocalFeedings(rowData.feedings || {});
    setEditingValue({});
  }, [rowData, rowData.feedings]);

  // Auto-submit cancel form when canceling
  useEffect(() => {
    if (canceling && cancelFormRef.current) {
      cancelFormRef.current.requestSubmit();
    }
  }, [canceling]);

  // Handle cancel feeding submit
  const handleCancelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let result = undefined;
    if (cancelAction && rowData.feedId) {
      result = await cancelAction(locInfo.id, today, rowData.feedId);
    }
    setIsLoading(false);
    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }
    // On success: restore planned values, show inputs, replace Cancel with Feed
    setFedState(false);
    if (setShowForm) {
      setShowForm(false);
    }
    setEditingValue({});
    setLocalFeedings(plannedFeedingsRef.current || {});
    setCanceling(false);
  };

  // When rowData.feedings changes (e.g., after feeding), update plannedFeedingsRef
  useEffect(() => {
    if (!fedState) {
      plannedFeedingsRef.current = rowData.feedings;
    }
  }, [rowData.feedings, fedState]);

  return (
    <tr>
      {rowCount && rowCount > 0 ? (
        <td
          rowSpan={rowCount}
          className="px-4 py-2 border border-gray-400 col-bassein sticky left-0 z-10 bg-white"
        >
          {locInfo.name}
        </td>
      ) : null}
      <td className="px-4 py-2 border border-gray-400 col-feedtype">
        {rowData.feedType}
      </td>
      <td className="px-4 py-2 border border-gray-400 col-feedname">
        {rowData.feedName}
      </td>
      {times.map((time: any, index: number) => {
        const feedingTime = parseInt(time.time.split(":")[0]);
        const key = `${locInfo.id}-${feedingTime}`;
        const feedingData = rowData.feedings?.[feedingTime];
        const baseQuantity = feedingData?.feeding;
        const editingValueFromFeedings =
          feedingData?.editing || localFeedings[feedingTime]?.editing;
        const calculatedQuantity = baseQuantity
          ? (parseFloat(baseQuantity) * (1 + percentFeeding / 100)).toFixed(2)
          : "";
        const isZeroAndFed =
          fedState && parseFloat(editingValueFromFeedings || "0") === 0;
        return (
          <React.Fragment key={index}>
            <td
              className={`px-4 py-2 border border-gray-400 col-time ${
                isZeroAndFed ? "bg-gray-100" : ""
              }`}
            >
              {calculatedQuantity}
            </td>
            <td
              className={`px-4 py-2 border border-gray-400 col-correction relative ${
                isZeroAndFed ? "bg-gray-100" : ""
              }`}
            >
              {fedState ? (
                <span className="text-center block font-semibold">
                  {editingValueFromFeedings !== undefined &&
                  editingValueFromFeedings !== null &&
                  editingValueFromFeedings !== ""
                    ? editingValueFromFeedings
                    : "-"}
                </span>
              ) : (
                !showForm && (
                  <>
                    <input
                      key={key}
                      type="text"
                      name={`time_${feedingTime}`}
                      value={editingValue[key] ?? calculatedQuantity}
                      onChange={(e) =>
                        handleInputChange(
                          feedingTime.toString(),
                          locInfo.id,
                          e.target.value
                        )
                      }
                      className="border-2 border-blue-500 p-1 w-full bg-yellow-50 text-center font-semibold rounded"
                      disabled={isBlocked}
                    />
                    {index < times.length - 1 && (
                      <button
                        type="button"
                        onClick={() => copyValueToAllInputs(time.time)}
                        className="absolute top-1 right-1 p-0 bg-transparent border-none shadow-none"
                        style={{ width: 20, height: 20 }}
                        title="Copy value to next times"
                      >
                        <Image
                          src={copyButton}
                          alt="copy right"
                          width={16}
                          height={16}
                        />
                      </button>
                    )}
                  </>
                )
              )}
            </td>
          </React.Fragment>
        );
      })}
      <td className="px-4 py-2 border border-gray-400 w-14">
        {!fedState && !showForm && hasPlannedFeedings && (
          <button
            type="button"
            className=""
            onClick={() => setShowForm && setShowForm(true)}
            disabled={isLoading || isBlocked}
          >
            <Image src={feedButton} alt="feeding icon" height={35} />
          </button>
        )}
        {showForm && !fedState && action && (
          <form ref={formRef} action={action} onSubmit={handleSubmit}>
            <input type="hidden" name="location_id" value={locInfo.id} />
            <input type="hidden" name="executed_by" value={3} />
            <input type="hidden" name="item_id" value={rowData.feedId} />
            <input type="hidden" name="batch_id" value={batch?.id} />
            <input type="hidden" name="date_time" value={today} />
            {times.map((time) => {
              const feedingTime = parseInt(time.time.split(":")[0]);
              const key = `${locInfo.id}-${feedingTime}`;
              const feedingData = rowData.feedings?.[feedingTime];
              const baseQuantity = feedingData?.feeding;
              const calculatedQuantity = baseQuantity
                ? (
                    parseFloat(baseQuantity) *
                    (1 + percentFeeding / 100)
                  ).toFixed(2)
                : "";
              const value =
                editingValue[key] !== undefined &&
                editingValue[key] !== null &&
                editingValue[key] !== ""
                  ? editingValue[key]
                  : calculatedQuantity;
              return (
                <input
                  key={key}
                  type="hidden"
                  name={`time_${feedingTime}`}
                  value={value}
                />
              );
            })}
            <div className="flex flex-col items-center">
              <button type="submit" className="hidden" disabled={isLoading} />
            </div>
            {/* Modal for progress */}
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              placement="top-center"
            >
              <ModalContent>
                <ModalHeader>Годування в процесі...</ModalHeader>
                <ModalBody>
                  <div className="w-full flex flex-col items-center">
                    <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 animate-pulse"
                        style={{ width: isLoading ? "100%" : "0%" }}
                      />
                    </div>
                    <span className="mt-2">Зачекайте, будь ласка...</span>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                  >
                    Закрити
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            {/* Modal for stock error */}
            <Modal
              isOpen={!!errorMessage}
              onClose={() => {
                setErrorMessage(null);
                setShowForm?.(false);
              }}
              placement="top-center"
            >
              <ModalContent>
                <ModalHeader>Помилка</ModalHeader>
                <ModalBody>
                  <div className="w-full flex flex-col items-center">
                    <span className="mt-2 text-red-600 font-semibold">
                      {errorMessage}
                    </span>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onClick={() => {
                      setErrorMessage(null);
                      setShowForm?.(false);
                    }}
                  >
                    Закрити
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            {/* Modal for feeding newer transactions error */}
            <Modal
              isOpen={showFeedNewerTxModal}
              onClose={() => {
                setShowFeedNewerTxModal(false);
                setIsBlocked(true);
              }}
              placement="top-center"
            >
              <ModalContent>
                <ModalHeader>Помилка</ModalHeader>
                <ModalBody>
                  <div className="w-full flex flex-col items-center">
                    <span className="mt-2 text-red-600 font-semibold">
                      Ви не можете виконати годування, оскільки існують новіші
                      транзакції.
                    </span>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onClick={() => {
                      setShowFeedNewerTxModal(false);
                      setIsBlocked(true);
                    }}
                  >
                    Закрити
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </form>
        )}
        {fedState && cancelAction && (
          <>
            <form
              ref={cancelFormRef}
              onSubmit={handleCancelSubmit}
              style={{ display: "inline" }}
            >
              <button
                type="button"
                className="hover:opacity-80"
                disabled={isLoading || canceling || isBlocked}
                onClick={() => {
                  if (!canceling) setShowCancelConfirm(true);
                }}
              >
                <Image src={cancelIcon} alt="cancel feeding" height={35} />
              </button>
            </form>
            {/* Cancel confirmation modal */}
            <Modal
              isOpen={showCancelConfirm}
              onClose={() => setShowCancelConfirm(false)}
              placement="top-center"
            >
              <ModalContent>
                <ModalHeader>Підтвердження</ModalHeader>
                <ModalBody>
                  <div className="w-full flex flex-col items-center">
                    <span className="mt-2 text-red-600 font-semibold">
                      Ви дійсно хочете скасувати це годування?
                    </span>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="solid"
                    onClick={async () => {
                      setShowCancelConfirm(false);
                      // Precheck for newer transactions
                      const canCancel = await checkLaterTransactions(
                        locInfo.id,
                        today,
                        rowData.feedId
                      );
                      if (!canCancel) {
                        setShowNewerTxModal(true);
                        return;
                      }
                      setCanceling(true); // Proceed with cancel
                    }}
                  >
                    Так
                  </Button>
                  <Button
                    color="default"
                    variant="light"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Ні
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            {/* Modal for newer transactions error */}
            <Modal
              isOpen={showNewerTxModal}
              onClose={() => {
                setShowNewerTxModal(false);
                setIsBlocked(true);
              }}
              placement="top-center"
            >
              <ModalContent>
                <ModalHeader>Помилка</ModalHeader>
                <ModalBody>
                  <div className="w-full flex flex-col items-center">
                    <span className="mt-2 text-red-600 font-semibold">
                      Ви не можете скасувати це годування, оскільки існують
                      новіші транзакції.
                    </span>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onClick={() => {
                      setShowNewerTxModal(false);
                      setIsBlocked(true);
                    }}
                  >
                    Закрити
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        )}
      </td>
    </tr>
  );
}
