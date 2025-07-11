"use client";

import EditButton from "../../../public/icons/edit.svg";
import SaveButton from "../../../public/icons/Save.svg";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { itembatches } from "@prisma/client";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { poolManagingType } from "@/types/app_types";

type PoolInfoProps = {
  areaId: number;
  location: {
    id: number;
    location_type_id: number;
    name: string;
    pool_id: number | null;
  };
  poolInfo: poolManagingType;

  batches: {
    id: bigint;
    name: string;
    items: {
      id: number;
      name: string;
    };
  }[];
  today: string;
};

export default function PoolInfoComponent({
  areaId,
  location,
  poolInfo,
  batches,
  today,
}: PoolInfoProps) {
  const [editionAllowed, setEditionAllowed] = useState<boolean>(false);

  const initialBatchId = Number(poolInfo.batch?.id);
  const initialCount = Number(poolInfo.qty);
  const initialAvMass = Number(poolInfo.fishWeight);

  // Стан для змінних
  const [batchId, setBatchId] = useState<number>(Number(poolInfo.batch?.id));
  const [count, setCount] = useState<number>(Number(poolInfo.qty));
  const [avMass, setAvMass] = useState<number>(Number(poolInfo.fishWeight));

  useEffect(() => {
    setCount(Number(poolInfo.qty));
  }, [poolInfo.qty]);

  const handleBatchIdChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setBatchId(Number(event.target.value));
  };

  const handleCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCount(Number(event.target.value));
  };

  const handleAvMassChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvMass(Number(event.target.value));
  };

  const [formState, updatePoolInfoAction] = useFormState(
    actions.updateCurrentPoolState,
    { message: "" }
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="w-full sm:w-1/3">
        <Select
          label="Партія"
          name="batch_id"
          className={`w-full focus:outline-none focus:ring focus:border-blue-300 ${
            !editionAllowed
              ? "text-gray-800 opacity-90 cursor-not-allowed"
              : "border-gray-900"
          }`}
          isRequired
          value={batchId}
          onChange={handleBatchIdChange}
          defaultSelectedKeys={[
            batches
              .filter((batch) => batch.name === poolInfo.batch?.name)
              .map((batch) => String(batch.id))[0],
          ]}
          isDisabled={!editionAllowed}
        >
          {batches.map((batch) => (
            <SelectItem key={Number(batch.id)} value={String(batch.id)}>
              {batch.name}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="w-full sm:w-1/4">
        <Input
          label="Кількість:"
          name="quantity"
          value={count.toString()}
          type="number"
          onChange={handleCountChange}
          disabled={!editionAllowed}
          isRequired
          className={`w-full focus:outline-none focus:ring focus:border-blue-300 ${
            !editionAllowed
              ? "text-gray-800 opacity-90 cursor-not-allowed"
              : "border-gray-900"
          }`}
        />
      </div>
      <div className="w-full sm:w-1/4">
        <Input
          label="Сер. вага, г"
          name="fishWeight"
          type="number"
          min={0.0001}
          step="any"
          value={avMass.toFixed(areaId < 3 ? 3 : 1)}
          onChange={handleAvMassChange}
          disabled={!editionAllowed}
          className={`w-full focus:outline-none focus:ring focus:border-blue-300 ${
            !editionAllowed
              ? "text-gray-800 opacity-90 cursor-not-allowed"
              : "border-gray-900"
          }`}
          isRequired
        />
      </div>

      {poolInfo.allowedToEdit && (
        <div className="w-full mt-4">
          <button
            className="hover:bg-blue-100 font-bold rounded transition duration-100 ease-in-out transform active:scale-75 active:shadow-none hover:shadow-lg"
            type="button"
            onClick={() => {
              setEditionAllowed(!editionAllowed);
            }}
          >
            <Image src={EditButton} alt="Edit" height={30} width={30} />
          </button>
        </div>
      )}

      {editionAllowed && (
        <div className="w-full mt-4">
          <form
            className="flex content-center gap-4"
            action={updatePoolInfoAction}
            onSubmit={() => {
              setEditionAllowed(false);
            }}
          >
            <input type="hidden" name="location_id_to" value={location.id} />

            {batchId != initialBatchId && (
              <input
                type="hidden"
                name="batch_id_before"
                value={initialBatchId}
              />
            )}
            {count != initialCount && (
              <input
                type="hidden"
                name="fish_amount_before"
                value={initialCount}
              />
            )}
            {avMass != initialAvMass && (
              <input
                type="hidden"
                name="average_fish_mass_before"
                value={initialAvMass}
              />
            )}

            <input type="hidden" name="fish_amount" value={count} />
            <input type="hidden" name="batch_id" value={batchId} />
            <input type="hidden" name="average_fish_mass" value={avMass} />
            <input type="hidden" name="today" value={today} />

            <button
              className="hover:bg-blue-100 font-bold rounded transition duration-100 ease-in-out transform active:scale-75 active:shadow-none hover:shadow-lg"
              type="submit"
            >
              <Image src={SaveButton} alt="Save" height={30} width={30} />
            </button>
          </form>
        </div>
      )}

      {formState && formState.message && (
        <div
          className={`w-full my-2 p-2 border rounded ${
            formState.message.includes("успішно")
              ? "bg-green-200 border-green-400"
              : "bg-red-200 border-red-400"
          }`}
        >
          {formState.message}
        </div>
      )}
    </div>
  );
}
