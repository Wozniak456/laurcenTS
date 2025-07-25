"use client";

import EditButton from "../../../public/icons/edit.svg";
import SaveButton from "../../../public/icons/Save.svg";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { itembatches } from "@prisma/client";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import {
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { poolManagingType } from "@/types/app_types";
import {
  canCancelStocking,
  cancelStocking,
} from "@/actions/crutial/cancelStocking";
import { useTransition } from "react";
import { usePoolValidation } from "@/utils/poolValidation";

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
  const { validateAndShowPopup } = usePoolValidation();

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

  const [cancelState, setCancelState] = useState<{
    loading: boolean;
    message: string | null;
  }>({ loading: false, message: null });

  const [pending, startTransition] = useTransition();

  // Modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const handleCancelStockingClick = async () => {
    setCancelState({ loading: true, message: null });

    try {
      // First check if pool operations are allowed
      const isAllowed = await validateAndShowPopup(
        location.id,
        today,
        "cancel"
      );
      if (!isAllowed) {
        setCancelState({ loading: false, message: null });
        return;
      }

      // Then check the existing cancellation logic
      const checkResult = await canCancelStocking(location.id, today);

      if (checkResult.canCancel) {
        // Show confirmation dialog
        setShowConfirmationModal(true);
      } else {
        // Show warning popup with reason
        setWarningMessage(checkResult.reason || "Cannot cancel stocking");
        setShowWarningModal(true);
      }
    } catch (error) {
      setWarningMessage("Error checking cancellation conditions");
      setShowWarningModal(true);
    } finally {
      setCancelState({ loading: false, message: null });
    }
  };

  const handleConfirmCancel = async () => {
    setShowConfirmationModal(false);
    setCancelState({ loading: true, message: null });

    try {
      const result = await cancelStocking(location.id, today);
      setCancelState({ loading: false, message: result.message });

      if (result.success) {
        // Reload the page after successful cancellation
        window.location.reload();
      }
    } catch (error) {
      setCancelState({
        loading: false,
        message: "Error cancelling stocking. Please try again.",
      });
    }
  };

  // Show cancel button if location has fish (qty > 0)
  const hasFish = !!(poolInfo.qty && poolInfo.qty > 0);

  return (
    <div className="container mx-auto m-4">
      <form action={updatePoolInfoAction}>
        <input type="hidden" name="today" value={today} />
        <input type="hidden" name="location_id_to" value={location.id} />
        <input type="hidden" name="batch_id" value={batchId} />
        <input type="hidden" name="fish_amount" value={count} />
        <input type="hidden" name="average_fish_mass" value={avMass} />
        <input type="hidden" name="batch_id_before" value={initialBatchId} />
        <input type="hidden" name="fish_amount_before" value={initialCount} />
        <input
          type="hidden"
          name="average_fish_mass_before"
          value={initialAvMass}
        />

        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="w-full sm:w-1/3">
            <Select
              label="Партія *"
              name="batch_id"
              isRequired
              selectedKeys={[String(batchId)]}
              onChange={handleBatchIdChange}
              isDisabled={!editionAllowed || hasFish}
              className={`w-full focus:outline-none focus:ring focus:border-blue-300 ${
                !editionAllowed || hasFish
                  ? "text-gray-800 opacity-90 cursor-not-allowed"
                  : "border-gray-900"
              }`}
            >
              {batches.map((batch) => (
                <SelectItem key={Number(batch.id)} value={Number(batch.id)}>
                  {batch.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-1/4">
            <Input
              label="Кількість: *"
              name="fish_amount"
              type="number"
              min={1}
              value={count.toString()}
              onChange={handleCountChange}
              isDisabled={!editionAllowed || hasFish}
              className={`w-full focus:outline-none focus:ring focus:border-blue-300 ${
                !editionAllowed || hasFish
                  ? "text-gray-800 opacity-90 cursor-not-allowed"
                  : "border-gray-900"
              }`}
              isRequired
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
              isDisabled={!editionAllowed || hasFish}
              className={`w-full focus:outline-none focus:ring focus:border-blue-300 ${
                !editionAllowed || hasFish
                  ? "text-gray-800 opacity-90 cursor-not-allowed"
                  : "border-gray-900"
              }`}
              isRequired
            />
          </div>

          {hasFish && (
            <div className="w-full mt-2">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                type="button"
                disabled={cancelState.loading || pending}
                onClick={() => startTransition(handleCancelStockingClick)}
              >
                {cancelState.loading || pending
                  ? "Перевірка..."
                  : "Відмінити зариблення"}
              </button>
              {cancelState.message && (
                <div className="mt-2 text-sm text-red-700">
                  {cancelState.message}
                </div>
              )}
            </div>
          )}

          {poolInfo.allowedToEdit && !hasFish && (
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

          {editionAllowed && !hasFish && (
            <div className="w-full mt-4">
              <button
                className="hover:bg-green-100 font-bold rounded transition duration-100 ease-in-out transform active:scale-75 active:shadow-none hover:shadow-lg"
                type="submit"
              >
                <Image src={SaveButton} alt="Save" height={30} width={30} />
              </button>
            </div>
          )}
        </div>

        {formState && formState.message && (
          <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
            {formState.message}
          </div>
        )}
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>Підтвердження</ModalHeader>
          <ModalBody>
            <div className="w-full flex flex-col items-center">
              <span className="mt-2 text-red-600 font-semibold">
                Ви дійсно хочете відмінити зариблення?
              </span>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="solid"
              onClick={handleConfirmCancel}
            >
              Так
            </Button>
            <Button
              color="default"
              variant="light"
              onClick={() => setShowConfirmationModal(false)}
            >
              Ні
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>Попередження</ModalHeader>
          <ModalBody>
            <div className="w-full flex flex-col items-center">
              <span className="mt-2 text-red-600 font-semibold">
                {warningMessage}
              </span>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onClick={() => setShowWarningModal(false)}
            >
              Закрити
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
