// import Link from 'next/link';
"use client";
import BatchCreatePage from "@/components/FishBatch/create-batch-form";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react";

interface BatchesComponentProps {
  batches: {
    id: bigint;
    name: string;
    items: {
      id: number;
      name: string;
    };
    initialQuantity: number;
    sentQuantity: number;
    returnedQuantity: number;
    remainingQuantity: number;
  }[];
  items: {
    id: number;
    name: string;
    description: string | null;
    item_type_id: number | null;
    feed_type_id: number | null;
    default_unit_id: number | null;
    parent_item: number | null;
    vendor_id: number | null;
  }[];
  units: {
    id: number;
    name: string;
  }[];
}

export default function BatchesComponent({
  batches,
  items,
  units,
}: BatchesComponentProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <div className="container p-4 w-full bg-gray-100 rounded-lg mt-4">
      <div className="flex justify-end">
        <Button onPress={onOpen} color="primary">
          Нова партія
        </Button>
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Нова партія
                </ModalHeader>
                <ModalBody>
                  <BatchCreatePage items={items} units={units} />
                </ModalBody>
                <ModalFooter></ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-6 gap-4 mb-4 font-semibold border-b pb-2">
          <div>Назва партії</div>
          <div>Початкова кількість</div>
          <div>Повернуто</div>
          <div>Відправлено</div>
          <div>Залишок</div>
          <div>Дії</div>
        </div>
        <div>
          {batches
            .sort((a, b) => Number(b.id) - Number(a.id))
            .map((batch, batchIndex) => (
              <Link
                key={batchIndex}
                href={`/batches/${batch.id}`}
                className="grid grid-cols-6 gap-4 items-center p-2 hover:bg-gray-200 border-b border-gray-300 pb-2"
              >
                <div>{batch.name}</div>
                <div>{batch.initialQuantity.toFixed(2)}</div>
                <div>{batch.returnedQuantity.toFixed(2)}</div>
                <div>{batch.sentQuantity.toFixed(2)}</div>
                <div>{batch.remainingQuantity.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Перегляд</div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
