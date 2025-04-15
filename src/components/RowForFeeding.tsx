import React, { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import feedButton from "../../public/icons/typcn_arrow-up-outline.svg";
import SuccessButton from "../../public/icons/SuccessFeeding.svg";
import CrossButton from "../../public/icons/UnsuccessfulFeeding.svg";
import cancelIcon from "../../public/icons/cancel-icon.svg";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import {
  checkLaterTransactions,
  cancelFeeding,
} from "@/actions/crutial/cancelFeeding";
import FormButton from "./common/form-button";
import { poolInfo } from "@/actions/stocking";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

interface RowForFeedingProps {
  locInfo: {
    id: number;
    name: string;
    percent_feeding?: number;
  };
  rowData: Feeding;
  times: {
    id: number;
    time: string;
  }[];
  rowCount?: number;
  today: string;
  batch?: {
    id: number;
    name: string;
  };
}

type itemAndTime = {
  item: string | undefined;
  time?: string;
} | null;

// Add type for server action response
interface FeedBatchResponse {
  message: string;
}

export default function RowForFeeding({
  locInfo,
  rowData,
  times,
  rowCount,
  today,
  batch,
}: RowForFeedingProps) {
  //   useEffect(() => {
  //     console.log("loc: ", locInfo.id, "Row Data:", rowData);
  //   }, [rowData]);

  const [localFeedings, setLocalFeedings] = useState(rowData.feedings || {});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [loadingMessage, setLoadingMessage] = useState<string>(
    "Годування в процесі..."
  );
  const {
    isOpen: isErrorOpen,
    onOpen: onErrorOpen,
    onClose: onErrorClose,
  } = useDisclosure();
  const {
    isOpen: isLoadingOpen,
    onOpen: onLoadingOpen,
    onClose: onLoadingClose,
  } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const fed = Object.values(localFeedings).some(
    (feeding) => feeding.editing && feeding.editing.trim() !== ""
  );

  const [formState, action] = useFormState<FeedBatchResponse, FormData>(
    actions.feedBatch,
    { message: "" }
  );

  const [editingValue, setEditingValue] = useState<{ [key: string]: string }>(
    {}
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const initialValues: { [key: string]: string } = {};

    times.forEach(({ time }) => {
      const feedingTime = parseInt(time.split(":")[0]);
      const feeding =
        localFeedings[feedingTime]?.feeding ||
        rowData.feedings?.[feedingTime]?.feeding;

      if (feeding) {
        const key = `${locInfo.id}-${feedingTime}`;
        const baseValue = parseFloat(feeding);
        const percentFeeding = locInfo.percent_feeding || 0;
        const adjustedValue = (baseValue * (1 + percentFeeding / 100)).toFixed(
          1
        );
        initialValues[key] = adjustedValue;
      }
    });

    setEditingValue(initialValues);
  }, [
    localFeedings,
    rowData.feedings,
    times,
    locInfo.id,
    locInfo.percent_feeding,
  ]);

  useEffect(() => {
    if (formState?.message) {
      if (formState.message.includes("Not enough stock")) {
        setErrorMessage(formState.message);
        onOpen();
      } else {
        setErrorMessage(null);
      }
    }
  }, [formState, onOpen]);

  // Format number to always show one decimal place
  const formatNumber = (value: string | number): string => {
    return Number(value).toFixed(1);
  };

  const handleInputChange = (time: string, poolId: number, target: string) => {
    const key = `${poolId}-${time}`;
    setEditingValue((prevState) => ({
      ...prevState,
      [key]: target,
    }));
  };

  const [buttonMode, setButtonMode] = useState(false);

  //   useEffect(() => {
  //     console.log(
  //       `pool: ${locInfo.name}. fed: ${fed}. buttonMode: ${buttonMode}`
  //     );
  //   }, [fed, buttonMode]);

  console.log("Location info:", {
    name: locInfo.name,
    percent: locInfo.percent_feeding,
  });

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget.closest("form") as HTMLFormElement;
    if (formElement) {
      // Reset states at the start of new submission
      setErrorMessage(null);
      setLoadingStatus("loading");
      setIsLoading(true);
      onLoadingOpen();

      try {
        setButtonMode(true);
        const formData = new FormData(formElement);

        // Call the server action directly instead of using the form
        const response = await actions.feedBatch({ message: "" }, formData);
        console.warn("Server response:", response);

        // Check for error first
        if (response?.message?.includes("Немає достатньо корму")) {
          console.warn("Feed submission failed: Not enough feed");
          setButtonMode(false);
          setErrorMessage(response.message);
          setLoadingStatus("error");

          await new Promise((resolve) => setTimeout(resolve, 500));
          onLoadingClose();
          onErrorOpen();
          return;
        }

        // If we didn't get an error about insufficient feed, proceed with the update
        Object.entries(editingValue).forEach(([key, value]) => {
          const [_, time] = key.split("-");
          if (time && value) {
            // Format the value to one decimal place only when storing the result
            const formattedValue = Number(value).toFixed(1);
            setLocalFeedings((prev) => ({
              ...prev,
              [time]: {
                feeding: formattedValue,
                editing: formattedValue,
              },
            }));
          }
        });

        // Show success state for a moment before closing
        setLoadingStatus("success");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onLoadingClose();
      } catch (error) {
        console.error("Feed submission failed:", error);
        setButtonMode(false);
        setErrorMessage("An error occurred while submitting the feed data");
        setLoadingStatus("error");

        await new Promise((resolve) => setTimeout(resolve, 500));
        onLoadingClose();
        onErrorOpen();
      } finally {
        setIsLoading(false);
        setButtonMode(false);
      }
    }
  };

  const startCancellation = async () => {
    onConfirmClose();
    try {
      setLoadingStatus("loading");
      setLoadingMessage("Перевірка можливості скасування...");
      onLoadingOpen();

      const canCancel = await checkLaterTransactions(locInfo.id, today);

      if (!canCancel) {
        setLoadingStatus("error");
        setErrorMessage(
          "Неможливо скасувати годування - існують пізніші транзакції"
        );
        onLoadingClose();
        onErrorOpen();
        return;
      }

      setLoadingMessage("Скасування годування...");
      await cancelFeeding(locInfo.id, today);

      setLoadingStatus("success");
      setLoadingMessage("Годування успішно скасовано!");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Only clear localFeedings, keep editingValue intact
      setLocalFeedings({});
      onLoadingClose();
    } catch (error) {
      console.error("Error canceling feeding:", error);
      setLoadingStatus("error");
      setErrorMessage("Помилка при скасуванні годування");
      onLoadingClose();
      onErrorOpen();
    }
  };

  const closeLoadingModal = () => {
    setLoadingStatus("loading");
    setIsLoading(false);
    setButtonMode(false);
    onLoadingClose();
  };

  return (
    <tr>
      {rowCount && rowCount > 0 ? (
        <td
          rowSpan={rowCount}
          className="px-4 py-2 border border-gray-400 w-14"
        >
          {locInfo.name}
        </td>
      ) : null}

      <td className="px-4 py-2 border border-gray-400 w-14">
        {rowData.feedType}
      </td>
      <td className="px-4 py-2 border border-gray-400 w-14">
        {rowData.feedName}
      </td>

      {/* Рендеримо для кожного часу */}
      {times.map((time, index) => {
        const feedingTime = parseInt(time.time.split(":")[0]);
        const key = `${locInfo.id}-${feedingTime}`;
        const baseQuantity = rowData.feedings?.[feedingTime]?.feeding;
        const percentFeeding = locInfo.percent_feeding || 0;
        const editingValueFromFeedings = localFeedings[feedingTime]?.editing;

        // Calculate the adjusted quantity with percentage
        const calculatedQuantity = baseQuantity
          ? (parseFloat(baseQuantity) * (1 + percentFeeding / 100)).toFixed(2)
          : "";

        const copyValueToAllInputs = () => {
          const valueToSpread = editingValue[key];
          if (!valueToSpread) return;

          const newEditingValues = { ...editingValue };
          const currentTimeIndex = times.findIndex(
            (t) => parseInt(t.time.split(":")[0]) === feedingTime
          );

          // Only copy to remaining columns (including current one)
          times.slice(currentTimeIndex).forEach((t) => {
            const timeKey = `${locInfo.id}-${parseInt(t.time.split(":")[0])}`;
            newEditingValues[timeKey] = valueToSpread;
          });
          setEditingValue(newEditingValues);
        };

        return (
          <React.Fragment key={index}>
            <td className="px-4 py-2 border border-gray-400 w-14">
              {calculatedQuantity}
            </td>

            {fed && localFeedings ? (
              <td className="px-4 py-2 border border-gray-400 w-14">
                {editingValueFromFeedings}
              </td>
            ) : (
              <td className="px-4 py-2 border border-gray-400 w-14 relative">
                {editingValue[key] && index < times.length - 1 && (
                  <button
                    type="button"
                    onClick={copyValueToAllInputs}
                    className="absolute top-0 right-1 text-blue-500 hover:text-blue-700 z-10"
                    title="Copy to all inputs in row"
                  >
                    →
                  </button>
                )}
                <input
                  name={`feed_given_${index}`}
                  className="border border-black w-full bg-blue-100 text-center no-spinners"
                  id={`feed_given_${index}`}
                  value={
                    editingValue[key] !== undefined
                      ? editingValue[key]
                      : calculatedQuantity
                  }
                  onChange={(e) =>
                    handleInputChange(
                      String(feedingTime),
                      locInfo.id,
                      e.target.value
                    )
                  }
                  type="number"
                  disabled={fed}
                />
              </td>
            )}
          </React.Fragment>
        );
      })}

      <td className="px-4 py-2 border border-gray-400 w-14">
        <form action={action}>
          <input type="hidden" name="location_id" value={locInfo.id} />
          <input type="hidden" name="executed_by" value={3} />
          <input type="hidden" name="item_id" value={rowData.feedId} />
          <input type="hidden" name="batch_id" value={batch?.id} />
          <input type="hidden" name="date_time" value={today} />

          {Object.entries(editingValue).map(([key, value]) => {
            const [poolId, time] = key.split("-");
            if (!poolId || !time || !value) return null;
            return (
              <input
                key={key}
                type="hidden"
                name={`time_${time}`}
                value={value}
              />
            );
          })}
            <div className="flex flex-col items-center">
            {!fed ? (
              <button
                type="submit"
                className=""
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {!buttonMode && !isLoading && (
                  <Image src={feedButton} alt="feeding icon" height={35} />
                )}
                {formState?.message && !errorMessage && !isLoading && (
                  <Image
                    src={formState.message && CrossButton}
                    alt="status icon"
                    height={30}
                  />
                )}
                {!formState && !isLoading && (
                  <Image src={SuccessButton} alt="status icon" height={30} />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onConfirmOpen}
                className="hover:opacity-80"
                disabled={isLoading}
              >
                <Image src={cancelIcon} alt="cancel feeding" height={35} />
              </button>
            )}
            </div>
        </form>

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          placement="center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Підтвердження скасування
                </ModalHeader>
                <ModalBody>
                  <p>Ви впевнені, що хочете скасувати годування?</p>
                  <p className="text-sm text-gray-500">
                    Ця дія не може бути скасована.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Відміна
                  </Button>
                  <Button color="primary" onPress={startCancellation}>
                    Підтвердити
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Loading Modal */}
        <Modal
          isOpen={isLoadingOpen}
          onClose={closeLoadingModal}
          hideCloseButton
          isDismissable={false}
          placement="center"
        >
          <ModalContent>
            <ModalBody className="py-6">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-semibold">{loadingMessage}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                  {loadingStatus === "loading" && (
                    <div className="bg-blue-600 h-2.5 rounded-full w-full animate-[progress_2s_ease-in-out_infinite]"></div>
                  )}
                  {loadingStatus === "success" && (
                    <div className="bg-green-600 h-2.5 rounded-full w-full"></div>
                  )}
                  {loadingStatus === "error" && (
                    <div className="bg-red-600 h-2.5 rounded-full w-full"></div>
                  )}
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Error Modal */}
        <Modal isOpen={isErrorOpen} onClose={onErrorClose} placement="center">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 text-red-600">
                  {errorMessage}
                  </ModalHeader>
                  <ModalBody>
                  <p>
                    Неможливо скасувати годування, оскільки існують пізніші
                    транзакції.
                  </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onPress={onClose}>
                      Close
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
      </td>
    </tr>
  );
}
