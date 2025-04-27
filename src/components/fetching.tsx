"use client";

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
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import { useState, useEffect } from "react";
import { FetchingReasons } from "@/types/fetching-reasons";
import { poolManagingType } from "@/types/app_types";
import { toast } from "sonner";

interface FetchingFormProps {
  location: {
    id: number;
    location_type_id: number;
    name: string;
    pool_id: number | null;
  };
  poolInfo: poolManagingType;
  locations: {
    id: number;
    name: string;
    location_type_id: number;
  }[];
  weekNum: number;
  today: string;
}

export default function FetchingForm({
  location,
  poolInfo,
  locations,
  weekNum,
  today,
}: FetchingFormProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formState, action] = useFormState(actions.fishFetching, {
    message: "",
  });

  const [commercialFishingAmount, setCommercialFishingAmount] = useState<
    number | undefined
  >(undefined);
  const [commercialFishingWeight, setCommercialFishingWeight] = useState<
    number | undefined
  >(undefined);

  const [sortedAmount, setSortedAmount] = useState<number | undefined>(
    undefined
  );
  const [sortedWeight, setSortedWeight] = useState<number | undefined>(
    undefined
  );

  const [growOutAmount, setGrowOutAmount] = useState<number | undefined>(
    undefined
  );
  const [growOutWeight, setGrowOutWeight] = useState<number | undefined>(
    undefined
  );

  const [moreThan500Amount, setMoreThan500Amount] = useState<
    number | undefined
  >(undefined);
  const [moreThan500Weight, setMoreThan500Weight] = useState<
    number | undefined
  >(undefined);

  const [lessThan500Amount, setLessThan500Amount] = useState<
    number | undefined
  >(undefined);
  const [lessThan500Weight, setLessThan500Weight] = useState<
    number | undefined
  >(undefined);

  const [selectedLocationId, setSelectedLocationId] = useState<
    number | undefined
  >(undefined);

  const validateForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    // Special validation for GrowOut (Доріст) - needs all three fields if any is filled
    if (growOutAmount) {
      if (!growOutWeight) {
        errors.push(`Для "Доріст" потрібно вказати загальну масу`);
      }
      if (!selectedLocationId) {
        errors.push(`Для "Доріст" потрібно вибрати басейн`);
      }
    }

    // Check each pair of quantity and weight for other types
    const validationPairs = [
      {
        amount: commercialFishingAmount,
        weight: commercialFishingWeight,
        name: "Вилов. товарна",
      },
      {
        amount: sortedAmount,
        weight: sortedWeight,
        name: "Відсортована",
      },
      {
        amount: moreThan500Amount,
        weight: moreThan500Weight,
        name: "> 500",
      },
      {
        amount: lessThan500Amount,
        weight: lessThan500Weight,
        name: "< 500",
      },
    ];

    for (const pair of validationPairs) {
      if ((pair.amount && !pair.weight) || (!pair.amount && pair.weight)) {
        errors.push(`Для "${pair.name}" потрібно вказати і кількість, і вагу`);
      }
    }

    if (errors.length > 0) {
      // Show all errors in a single toast with custom styling
      toast.error(
        <div className="flex flex-col gap-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="p-1 border-b border-red-200 last:border-0"
              style={{
                animation: `fadeOut 2s ease ${(index + 1) * 2}s forwards`,
              }}
            >
              {error}
            </div>
          ))}
        </div>,
        {
          duration: (errors.length + 1) * 2000,
          style: {
            backgroundColor: "rgb(254 226 226)",
            color: "rgb(185 28 28)",
            minWidth: "320px",
          },
        }
      );
      return; // Stop here if there are validation errors
    }

    // If validation passes, get the form element and submit using the server action
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const result = await actions.fishFetching(undefined, formData);

    if (result?.message) {
      toast.error(result.message);
    } else {
      onClose(); // Close the modal on success
    }
  };

  // Add the animation style to the component
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; height: 0; margin: 0; padding: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div>
      <Button onPress={onOpen} color="default">
        Вилов
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="top-center"
        size="4xl"
      >
        <ModalContent className="w-1/2">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h1>Вилов для {location.name}</h1>
                <p>Тиждень: {weekNum}</p>
              </ModalHeader>
              <ModalBody>
                <form onSubmit={validateForm}>
                  <div className="flex gap-4 mb-8 flex-wrap w-full justify-around">
                    <input
                      type="hidden"
                      name="location_id_from"
                      value={location.id}
                    />
                    <input
                      type="hidden"
                      name="batch_id"
                      value={Number(poolInfo.batch?.id)}
                    />
                    <input
                      type="hidden"
                      name="fish_qty_in_location_from"
                      value={poolInfo.qty}
                    />
                    <input
                      type="hidden"
                      name="average_fish_mass"
                      value={poolInfo.fishWeight}
                    />

                    <input
                      type="hidden"
                      name="old_average_fish_mass"
                      value={poolInfo.fishWeight}
                    />

                    <input type="hidden" name="week_num" value={weekNum} />
                    <input type="hidden" name="today" value={today} />

                    <div className="w-full my-4 flex flex-col gap-4">
                      <div>
                        <label>{FetchingReasons.CommercialFishing}</label>
                        <div className="flex gap-2">
                          <Input
                            name="commercial_fishing_amount"
                            placeholder={`Кількість`}
                            fullWidth
                            onChange={(e) => {
                              setCommercialFishingAmount(
                                Number(e.target.value)
                              );
                            }}
                            type="number"
                            min={1}
                            max={poolInfo.qty}
                          />
                          <Input
                            name="commercial_fishing_total_weight"
                            placeholder={`Загальна маса`}
                            fullWidth
                            onChange={(e) => {
                              setCommercialFishingWeight(
                                Number(e.target.value)
                              );
                            }}
                            type="number"
                            min={0.0001}
                            step="any"
                          />
                          {commercialFishingAmount &&
                            commercialFishingWeight && (
                              <p>
                                Середня вага:{" "}
                                {(
                                  commercialFishingWeight /
                                  commercialFishingAmount
                                ).toFixed(1)}
                              </p>
                            )}
                        </div>
                      </div>
                      <div>
                        <label>{FetchingReasons.Sorted}</label>
                        <div className="flex gap-2">
                          <Input
                            name="sorted_fishing_amount"
                            placeholder={`Кількість`}
                            fullWidth
                            onChange={(e) => {
                              setSortedAmount(Number(e.target.value));
                            }}
                            type="number"
                            min={1}
                            max={poolInfo.qty}
                          />
                          <Input
                            name="sorted_fishing_total_weight"
                            placeholder={`Загальна маса`}
                            fullWidth
                            onChange={(e) => {
                              setSortedWeight(Number(e.target.value));
                            }}
                            type="number"
                            min={0.0001}
                            step="any"
                          />
                          {sortedAmount && sortedWeight && (
                            <p>
                              Середня вага:{" "}
                              {(sortedWeight / sortedAmount).toFixed(1)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label>{FetchingReasons.GrowOut}</label>
                        <div className="flex gap-2">
                          <Input
                            name="growout_fishing_amount"
                            placeholder={`Кількість`}
                            fullWidth
                            onChange={(e) => {
                              setGrowOutAmount(Number(e.target.value));
                            }}
                            type="number"
                            min={1}
                            max={poolInfo.qty}
                          />
                          <Input
                            name="growout_fishing_total_weight"
                            placeholder={`Загальна маса`}
                            fullWidth
                            onChange={(e) => {
                              setGrowOutWeight(Number(e.target.value));
                            }}
                            type="number"
                            min={0.0001}
                            step="any"
                          />
                          <Select
                            label="Басейн"
                            name="location_id"
                            onChange={(e) => {
                              setSelectedLocationId(Number(e.target.value));
                            }}
                          >
                            {locations.map((loc) => (
                              <SelectItem
                                key={Number(loc.id)}
                                value={Number(loc.id)}
                              >
                                {loc.name}
                              </SelectItem>
                            ))}
                          </Select>
                          {growOutAmount && growOutWeight && (
                            <label>
                              Середня вага:{" "}
                              {(growOutWeight / growOutAmount).toFixed(1)}
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <label>{FetchingReasons.MoreThan500}</label>
                        <div className="flex gap-2">
                          <Input
                            name="more500_fishing_amount"
                            placeholder={`Кількість`}
                            fullWidth
                            onChange={(e) => {
                              setMoreThan500Amount(Number(e.target.value));
                            }}
                            type="number"
                            min={1}
                            max={poolInfo.qty}
                          />
                          <Input
                            name="more500_fishing_total_weight"
                            placeholder={`Загальна маса`}
                            fullWidth
                            onChange={(e) => {
                              setMoreThan500Weight(Number(e.target.value));
                            }}
                            type="number"
                            min={0.0001}
                            step="any"
                          />
                          {moreThan500Amount && moreThan500Weight && (
                            <label>
                              Середня вага:{" "}
                              {(moreThan500Weight / moreThan500Amount).toFixed(
                                1
                              )}
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <label>{FetchingReasons.LessThan500}</label>
                        <div className="flex gap-2">
                          <Input
                            name="less500_fishing_amount"
                            placeholder={`Кількість`}
                            fullWidth
                            onChange={(e) => {
                              setLessThan500Amount(Number(e.target.value));
                            }}
                            type="number"
                            min={1}
                            max={poolInfo.qty}
                          />
                          <Input
                            name="less500_fishing_total_weight"
                            placeholder={`Загальна маса`}
                            fullWidth
                            onChange={(e) => {
                              setLessThan500Weight(Number(e.target.value));
                            }}
                            type="number"
                            min={0.0001}
                            step="any"
                          />
                          {lessThan500Amount && lessThan500Weight && (
                            <label>
                              Середня вага:{" "}
                              {(lessThan500Weight / lessThan500Amount).toFixed(
                                1
                              )}
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <FormButton color="danger">Забрати з басейна</FormButton>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
