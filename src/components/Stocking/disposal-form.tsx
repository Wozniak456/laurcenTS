"use client";

import * as actions from "@/actions";
import { useFormState } from "react-dom";
import { useState } from "react";
import { disposalItem, poolManagingType } from "@/types/app_types";
import { Input, Select, SelectItem } from "@nextui-org/react";
import FormButton from "../common/form-button";

interface DisposalFormPageProps {
  location: {
    id: number;
    location_type_id: number;
    name: string;
    pool_id: number | null;
  };
  poolInfo: poolManagingType;
  reasons: disposalItem[];
  today: string;
}

export default function DisposalFormPage({
  location,
  poolInfo,
  reasons,
  today,
}: DisposalFormPageProps) {
  const [selectedReason, setSelectedReason] = useState<number | undefined>(
    undefined
  );

  function handleReasonChange(reason_id: any) {
    setSelectedReason(reason_id);
  }

  const [formState, action] = useFormState(actions.disposal, { message: "" });

  return (
    // <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center z-10">
    <div className="">
      <form className="" action={action}>
        <input
          type="hidden"
          name="batch_id"
          value={String(poolInfo.batch?.id)}
        />
        <input
          type="hidden"
          name="location_id_from"
          value={String(location.id)}
        />
        <input
          type="hidden"
          name="fish_amount_in_pool"
          value={String(poolInfo.qty)}
        />
        <input
          type="hidden"
          name="average_fish_mass"
          value={String(poolInfo.fishWeight)}
        />
        <input type="hidden" name="today" value={today} />
        <div className="flex flex-wrap gap-2 mb-4 justify-between">
          <Select
            label="Причина списання:"
            name="reason"
            // isInvalid={!!formState.errors?.unit_id}
            // errorMessage={formState.errors?.unit_id}
            isRequired
            onChange={(event) => {
              handleReasonChange(event.target.value);
            }}
          >
            {reasons.map((reason) => (
              <SelectItem key={reason.id} value={reason.id}>
                {reason.reason}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="Кількість:"
            name="qty"
            type="number"
            min={1}
            max={poolInfo.qty}
            // isInvalid={!!formState.errors?.quantity}
            // errorMessage={formState.errors?.quantity}
            isRequired
          />
        </div>

        <div className="flex justify-end">
          <FormButton color="danger">Списати</FormButton>
        </div>
      </form>
    </div>
    // </div>
  );
}
