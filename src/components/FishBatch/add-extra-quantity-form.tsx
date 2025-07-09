"use client";
import { useFormState } from "react-dom";
import { addExtraQuantity } from "@/actions/CRUD/itemBatch/addExtraQuantity";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import FormButton from "../common/form-button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddExtraQuantityFormProps {
  batchId: bigint;
  batchName: string;
  unitId: number;
  unitName: string;
}

export default function AddExtraQuantityForm({
  batchId,
  batchName,
  unitId,
  unitName,
}: AddExtraQuantityFormProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formState, formAction] = useFormState(addExtraQuantity, {
    message: "",
  });
  const [extraQuantity, setExtraQuantity] = useState<string>("");
  const [shouldClose, setShouldClose] = useState(false);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
    setExtraQuantity("");
    setShouldClose(false); // reset before submit
  };

  return (
    <>
      <Button onPress={onOpen} color="success" size="sm">
        Додати кількість
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => {
            // Close modal after success, only once
            if (
              formState.message &&
              formState.message.includes("Додано") &&
              !shouldClose
            ) {
              router.refresh();
              setShouldClose(true);
              setTimeout(() => onClose(), 0);
            }
            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Додати додаткову кількість
                </ModalHeader>
                <ModalBody>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Партія: <span className="font-semibold">{batchName}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      * Документ буде створено з тією ж датою та часом, що й
                      оригінальна партія
                    </p>
                  </div>

                  <form action={handleSubmit} className="flex flex-col gap-4">
                    <input
                      type="hidden"
                      name="batch_id"
                      value={String(batchId)}
                    />
                    <input type="hidden" name="executed_by" value="3" />

                    <Input
                      label="Додаткова кількість"
                      name="extra_quantity"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={extraQuantity}
                      onChange={(e) => setExtraQuantity(e.target.value)}
                      placeholder="Введіть кількість"
                      isRequired
                    />

                    <Input
                      label="Одиниця виміру"
                      name="unit_id"
                      value={unitName}
                      disabled
                      readOnly
                    />
                    <input type="hidden" name="unit_id" value={unitId} />

                    <Input
                      label="Коментар (необов'язково)"
                      name="comments"
                      placeholder="Причина додавання кількості"
                    />

                    {formState.message && (
                      <div
                        className={`p-2 border rounded ${
                          formState.message.includes("Додано")
                            ? "bg-green-100 border-green-400 text-green-700"
                            : "bg-red-100 border-red-400 text-red-700"
                        }`}
                      >
                        {formState.message}
                      </div>
                    )}

                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Скасувати
                      </Button>
                      <FormButton color="primary">Додати</FormButton>
                    </ModalFooter>
                  </form>
                </ModalBody>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
}
