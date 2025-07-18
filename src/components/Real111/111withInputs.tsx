"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import Image from "next/image";
import SaveButton from "../../../public/icons/Save.svg";
import FormButton from "../common/form-button";

interface FilterableTableProps {
  areaId: number;
  date: string;
  poolIndex: number;
  aggregatedData?: DataItem;
}
export type DataItem = {
  poolName: string;
  batchName?: string;
  quantity?: number;
  planWeight?: number;
  factWeight?: number;
  feed?: string;
  updated?: string;
};

export default function SelectDay({
  areaId,
  date,
  poolIndex,
  aggregatedData,
}: FilterableTableProps) {
  //  const todayDate = new Date(date)
  const today = date;

  const initialFishWeight = aggregatedData?.factWeight;

  const [fishWeight, setFishWeight] = useState<number | undefined>(
    initialFishWeight
  );

  const handleFishWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(",", ".");
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setFishWeight(parsedValue);
    } else {
      setFishWeight(undefined);
    }
  };

  const [formState, action] = useFormState(actions.updateSmth, { message: "" });
  const color = getDiff(aggregatedData?.planWeight, aggregatedData?.factWeight);

  return (
    <>
      <td className="px-4 py-2 border text-center border-gray-400">
        {" "}
        {aggregatedData?.batchName}
      </td>
      <td className="px-4 py-2 border text-center border-gray-400">
        {" "}
        {aggregatedData?.quantity}
      </td>

      <td className="px-4 py-2 border text-center border-gray-400">
        {aggregatedData?.planWeight?.toFixed(areaId < 3 ? 3 : 1)}
      </td>
      <td
        className={`px-4 py-2 border text-center border-gray-400 ${
          fishWeight != initialFishWeight && "bg-yellow-100"
        } bg-${color}-200`}
      >
        <input
          type="number"
          step="0.001"
          value={
            fishWeight !== undefined
              ? fishWeight.toFixed(areaId < 3 ? 3 : 1).toString()
              : ""
          }
          onChange={handleFishWeightChange}
          className="px-2 py-1 rounded-md text-center"
          disabled={!aggregatedData?.batchName || date != today}
        />
      </td>
      <td className="px-4 py-2 border text-center border-gray-400">
        {" "}
        {aggregatedData?.feed}
      </td>
      <td className="px-4 py-2 border text-center border-gray-400">
        {" "}
        {aggregatedData?.updated}
      </td>
      <td>
        <form action={action}>
          <input type="hidden" name="location_id_to" value={poolIndex} />
          <input type="hidden" name="date" value={date} />
          {fishWeight !== initialFishWeight && (
            <input type="hidden" name="average_fish_mass" value={fishWeight} />
          )}

          {fishWeight != initialFishWeight ? (
            <div className="w-10 ">
              <FormButton color="default">
                <Image src={SaveButton} alt="save" width={30} />
              </FormButton>
            </div>
          ) : (
            <div className="w-10 ">
              <button className=" p-1 rounded hover:bg-green-200"></button>
            </div>
          )}
        </form>
      </td>
    </>
  );
}

function getDiff(
  planWeight: number | undefined,
  actualWeight: number | undefined
) {
  if (planWeight && actualWeight && planWeight - actualWeight >= 10) {
    return "red";
  } else if (planWeight && actualWeight) {
    return "green";
  }
}
