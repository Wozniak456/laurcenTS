import React, { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import feedButton from "../../public/icons/typcn_arrow-up-outline.svg";
import SuccessButton from "../../public/icons/SuccessFeeding.svg";
import CrossButton from "../../public/icons/UnsuccessfulFeeding.svg";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
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
    if (rowData.feedings) {
      setLocalFeedings(rowData.feedings);
    }
  }, [rowData.feedings]);

  useEffect(() => {
    const initialValues: { [key: string]: string } = {};

    times.forEach(({ time }) => {
      const feedingTime = parseInt(time.split(":")[0]);
      const feeding = localFeedings[feedingTime]?.feeding;

      if (feeding) {
        const key = `${locInfo.id}-${feedingTime}`;
        const baseValue = parseFloat(feeding);
        const percentFeeding = locInfo.percent_feeding || 0;
        const adjustedValue = (baseValue * (1 + percentFeeding / 100)).toFixed(
          2
        );
        initialValues[key] = adjustedValue;
      }
    });

    setEditingValue(initialValues);
  }, [localFeedings, times, locInfo.id, locInfo.percent_feeding]);

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

  function handleInputChange(time: string, poolId: number, target: string) {
    const key = `${poolId}-${time}`;
    setEditingValue((prevState) => ({
      ...prevState,
      [key]: target,
    }));
  }

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
      console.log("Submitting feed data:", {
        feedId: rowData.feedId,
        feedName: rowData.feedName,
        feedType: rowData.feedType,
        locationId: locInfo.id,
        editingValues: editingValue,
      });

      // Create hidden inputs for any last-minute changes
      Object.entries(editingValue).forEach(([key, value]) => {
        const [poolId, time] = key.split("-");
        if (!poolId || !time || !value) return;

        let input = formElement.querySelector(
          `input[name="time_${time}"]`
        ) as HTMLInputElement;
        if (!input) {
          input = document.createElement("input");
          input.type = "hidden";
          input.name = `time_${time}`;
          formElement.appendChild(input);
        }
        input.value = value;
      });

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
          onOpen();
          return; // Exit early to prevent UI update
        }

        // If we didn't get an error about insufficient feed, proceed with the update
        Object.entries(editingValue).forEach(([key, value]) => {
          const [_, time] = key.split("-");
          if (time && value) {
            setLocalFeedings((prev) => ({
              ...prev,
              [time]: {
                feeding: value,
                editing: value,
              },
            }));
          }
        });
      } catch (error) {
        console.error("Feed submission failed:", error);
        setButtonMode(false);
        setErrorMessage("An error occurred while submitting the feed data");
        onOpen();
      }
    }
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
                {!fed && editingValue[key] && index < times.length - 1 && (
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
                  className="border border-black w-full bg-blue-100 text-center"
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
          {!fed && (
            <div className="flex flex-col items-center">
              <button type="submit" className="" onClick={handleSubmit}>
                {!buttonMode && (
                  <Image src={feedButton} alt="feeding icon" height={35} />
                )}
                {formState?.message && !errorMessage && (
                  <Image
                    src={formState.message && CrossButton}
                    alt="status icon"
                    height={30}
                  />
                )}
                {!formState && (
                  <Image src={SuccessButton} alt="status icon" height={30} />
                )}
              </button>
            </div>
          )}
        </form>
        {errorMessage && (
          <Modal isOpen={isOpen} onClose={onClose} placement="center">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 text-red-600">
                    Insufficient Stock
                  </ModalHeader>
                  <ModalBody>
                    <p>{errorMessage}</p>
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
        )}
      </td>
    </tr>
  );
}
