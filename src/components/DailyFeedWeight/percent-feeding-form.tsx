"use client";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import { useState } from "react";

type PercentFormType = {
  location?: {
    id: number;
    name: string;
    percent_feeding?: number;
  };
};

export default function PercentFeedingForm(props: PercentFormType) {
  const [percentValue, setPercentValue] = useState<string>(
    props.location?.percent_feeding?.toString() || ""
  );

  const [formState, action] = useFormState(actions.managePercentFeeding, {
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentValue(e.target.value);
  };

  return (
    <div className="">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Редагування % відхилення
      </h2>
      <form className="mb-4 flex flex-col gap-4" action={action}>
        <div className="flex gap-2 items-center justify-center mb-4">
          <h1 className="text-lg font-semibold min-w-24">
            {props.location?.name}
          </h1>
          <div className="flex flex-col gap-1">
            <input
              id="percent"
              name="percent"
              value={percentValue}
              onChange={handleChange}
              type="number"
              className="border rounded px-2 py-1"
            />
          </div>
          <input type="hidden" name={`location`} value={props.location?.id} />
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Зберегти
          </button>
        </div>
      </form>
    </div>
  );
}
