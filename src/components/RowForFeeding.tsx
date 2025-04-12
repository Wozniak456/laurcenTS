import React, { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import feedButton from "../../public/icons/typcn_arrow-up-outline.svg";
import SuccessButton from "../../public/icons/SuccessFeeding.svg";
import CrossButton from "../../public/icons/UnsuccessfulFeeding.svg";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import FormButton from "./common/form-button";
import { poolInfo } from "@/actions/stocking";

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

  const fed = Object.values(localFeedings).some(
    (feeding) => feeding.editing && feeding.editing.trim() !== ""
  );

  const [formState, action] = useFormState(actions.feedBatch, { message: "" });

  const [editingValue, setEditingValue] = useState<{ [key: string]: string }>(
    {}
  );

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

        // Update local feedings state
        setLocalFeedings((prev) => ({
          ...prev,
          [time]: {
            feeding: value,
            editing: value,
          },
        }));
      });

      setButtonMode(true);
      formElement.requestSubmit();
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
        const baseQuantity = localFeedings[feedingTime]?.feeding;
        const percentFeeding = locInfo.percent_feeding || 0;
        const editingValueFromFeedings = localFeedings[feedingTime]?.editing;

        // Calculate the adjusted quantity with percentage
        const calculatedQuantity = baseQuantity
          ? (parseFloat(baseQuantity) * (1 + percentFeeding / 100)).toFixed(2)
          : "";

        return (
          <React.Fragment key={index}>
            <td className="px-4 py-2 border border-gray-400 w-14">
              {calculatedQuantity}
            </td>

            {fed && localFeedings ? (
              <td className="px-4 py-2 border border-gray-400 w-14">
                {editingValueFromFeedings === undefined ||
                editingValueFromFeedings === null
                  ? calculatedQuantity
                  : editingValueFromFeedings}
              </td>
            ) : (
              <td className="px-4 py-2 border border-gray-400 w-14">
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
            <button type="submit" className="" onClick={handleSubmit}>
              {!buttonMode && (
                <Image src={feedButton} alt="feeding icon" height={35} />
              )}
              {formState?.message && (
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
          )}
        </form>
      </td>
    </tr>
  );
}
