"use client";

import * as actions from "@/actions";
import { useFormState } from "react-dom";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import deleteImg from "../../public/icons/delete.svg";
import Image from "next/image";
import FormButton from "./common/form-button";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { poolManagingType } from "@/types/app_types";

interface PartitionFormPageProps {
  location: {
    id: number;
    location_type_id: number;
    name: string;
    pool_id: number | null;
  };
  poolInfo: poolManagingType | undefined;
  locations: location[];
  today: string;
}

type location = {
  id: number;
  name: string;
  location_type_id: number;
};

export default function PartitionFormPage({
  location,
  poolInfo,
  locations,
  today,
}: PartitionFormPageProps) {
  const router = useRouter();
  const [selectedPools, setSelectedPools] = useState<(number | null)[]>([]);
  const [lineWeights, setLineWeights] = useState<{ [key: number]: number }>({});
  const [formState, action] = useFormState(actions.batchDivision, {
    message: "",
  });

  // Handle successful split operation
  useEffect(() => {
    if (formState?.message && formState.message.includes("успішно")) {
      // Use Next.js router for a clean redirect
      setTimeout(() => {
        router.push(`/pool-managing/day/${today}`);
      }, 100);
    }
  }, [formState, today, router]);

  const handleDeleteButton = (index: number) => {
    setSelectedPools(selectedPools.filter((item) => item !== index));
    // Remove the weight for the deleted line
    const newWeights = { ...lineWeights };
    delete newWeights[index];
    setLineWeights(newWeights);
  };

  const handlePoolChange = (index: number) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedPoolId = parseInt(e.target.value);
      setSelectedPools((prevSelectedPools) => {
        const updatedSelectedPools = [...prevSelectedPools];
        updatedSelectedPools[index] = selectedPoolId;
        return updatedSelectedPools;
      });
    };
  };

  const handleWeightChange = (index: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const weight = parseFloat(e.target.value);
      if (!isNaN(weight)) {
        setLineWeights((prev) => ({
          ...prev,
          [index]: weight,
        }));
      }
    };
  };

  const handleAddPool = () => {
    setSelectedPools([...selectedPools, null]);
  };

  return (
    <form className="" action={action}>
      <div className="mb-4">
        <input type="hidden" name="location_id_from" value={location.id} />
        <input type="hidden" name="today" value={today} />
      </div>
      <div className="mb-4 flex flex-col items-center">
        <div className="flex flex-col my-4">
          <p className="font-semibold text-base mb-8">Басейни для розподілу:</p>
          <input
            type="hidden"
            name="batch_id_from"
            value={String(poolInfo?.batch?.id)}
          />
          <input
            type="hidden"
            name="fish_qty_in_location_from"
            value={poolInfo?.qty}
          />
          <input
            type="hidden"
            name="old_average_fish_mass"
            value={poolInfo?.fishWeight}
          />

          {selectedPools.map((selectedPoolId, index) => {
            return (
              <div
                key={index}
                className="flex flex-row items-center gap-2 mb-4"
              >
                <button
                  className="hover:bg-red-100 mr-2 rounded"
                  onClick={() => handleDeleteButton(index)}
                  type="button"
                >
                  <Image src={deleteImg} alt="Delete" width={30} height={30} />
                </button>
                <Select
                  label="Басейн:"
                  name={`location_id_to_${index}`}
                  isRequired
                  onChange={handlePoolChange(index)}
                  className="w-1/4"
                >
                  {locations
                    .filter((location) => location.location_type_id === 2)
                    .sort((a, b) => a.id - b.id)
                    .map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                </Select>
                <Input
                  placeholder="Кількість:"
                  name={`stocking_fish_amount_${index}`}
                  type="number"
                  min={1}
                  isRequired
                  className="w-1/4"
                />
                <Input
                  placeholder="Сер. вага:"
                  name={`average_fish_mass_${index}`}
                  type="number"
                  min="0.1"
                  step="0.1"
                  isRequired
                  value={
                    lineWeights[index] && !isNaN(lineWeights[index])
                      ? lineWeights[index].toString()
                      : ""
                  }
                  onChange={handleWeightChange(index)}
                  className="w-1/4"
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-around m-4 w-full">
          <Button color="primary" onClick={handleAddPool} type="button">
            Додати басейн
          </Button>
          {selectedPools.length > 0 && (
            <>
              <FormButton color="primary">Розділити</FormButton>
            </>
          )}
        </div>
      </div>
      {formState && formState.message && (
        <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
          {formState.message}
        </div>
      )}
    </form>
  );
}
