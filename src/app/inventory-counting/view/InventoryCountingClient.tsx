"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
  Chip,
  Badge,
} from "@nextui-org/react";
import { useFormState } from "react-dom";
import { createInventoryCounting } from "@/actions/CRUD/inventory-counting/createInventoryCounting";
import { addInventoryLine } from "@/actions/CRUD/inventory-counting/addInventoryLine";
import { postInventoryCounting } from "@/actions/CRUD/inventory-counting/postInventoryCounting";
import { deleteInventoryCounting } from "@/actions/CRUD/inventory-counting/deleteInventoryCounting";
import { updateInventoryLine } from "@/actions/CRUD/inventory-counting/updateInventoryLine";
import { deleteInventoryLine } from "@/actions/CRUD/inventory-counting/deleteInventoryLine";
import { localStorageUtils } from "@/utils/localStorage";

interface InventoryCountingClientProps {
  inventoryCountings: any[];
  feedTypes: any[];
  items: any[];
  batches: any[];
}

export default function InventoryCountingClient({
  inventoryCountings,
  feedTypes,
  items,
  batches,
}: InventoryCountingClientProps) {
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(
    null
  );
  const [selectedFeedType, setSelectedFeedType] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [actualQuantity, setActualQuantity] = useState<string>("");
  const [inventoryToDelete, setInventoryToDelete] = useState<any>(null);
  const [editingLine, setEditingLine] = useState<any>(null);
  const [editingQuantity, setEditingQuantity] = useState<string>("");
  const [lineToDelete, setLineToDelete] = useState<any>(null);
  const [inventoryToPost, setInventoryToPost] = useState<any>(null);

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isAddLineOpen,
    onOpen: onAddLineOpen,
    onClose: onAddLineClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteLineOpen,
    onOpen: onDeleteLineOpen,
    onClose: onDeleteLineClose,
  } = useDisclosure();
  const {
    isOpen: isPostOpen,
    onOpen: onPostOpen,
    onClose: onPostClose,
  } = useDisclosure();

  const [createFormState, createAction] = useFormState(
    createInventoryCounting,
    { errors: {} }
  );

  // Handle successful creation and close modal
  React.useEffect(() => {
    if (createFormState.message) {
      onCreateClose();
    }
  }, [createFormState.message, onCreateClose]);
  const [addLineFormState, addLineAction] = useFormState(addInventoryLine, {
    errors: {},
  });

  // Preserve selections after form submission
  React.useEffect(() => {
    if (addLineFormState.message) {
      // Form was successful, reset selections
      setSelectedFeedType("");
      setSelectedItem("");
      setSelectedBatch("");
      setActualQuantity("");

      // Refresh the selected inventory to show the new line
      if (selectedInventoryId && inventoryCountings.length > 0) {
        const updatedInventory = inventoryCountings.find(
          (inv) => inv.id === selectedInventoryId
        );
        if (updatedInventory) {
          setSelectedInventory(updatedInventory);
        }
      }
    }
  }, [addLineFormState.message, selectedInventoryId, inventoryCountings]);
  const [postFormState, postAction] = useFormState(postInventoryCounting, {
    errors: {},
  });

  // Handle successful posting and close modal
  React.useEffect(() => {
    if (postFormState.message) {
      onPostClose();
    }
  }, [postFormState.message, onPostClose]);
  const [deleteFormState, deleteAction] = useFormState(
    deleteInventoryCounting,
    {
      errors: {},
    }
  );
  const [updateLineFormState, updateLineAction] = useFormState(
    updateInventoryLine,
    {
      errors: {},
    }
  );
  const [deleteLineFormState, deleteLineAction] = useFormState(
    deleteInventoryLine,
    {
      errors: {},
    }
  );
  const [isDeletingLine, setIsDeletingLine] = useState(false);

  const handleCreateInventory = () => {
    onCreateOpen();
  };

  const handleAddLine = (inventory: any) => {
    setSelectedInventory(inventory);
    setSelectedFeedType("");
    setSelectedItem("");
    setSelectedBatch("");
    setActualQuantity("");
    onAddLineOpen();
  };

  const handlePostInventory = (inventory: any) => {
    setInventoryToPost(inventory);
    onPostOpen();
  };

  const handleDeleteInventory = (inventory: any) => {
    setInventoryToDelete(inventory);
    onDeleteOpen();
  };

  const handleEditLine = (line: any) => {
    setEditingLine(line);
    setEditingQuantity(line.actual_quantity.toString());
  };

  // Handle form state changes for line updates
  React.useEffect(() => {
    if (updateLineFormState.message) {
      // Form was successful, reset editing state
      setEditingLine(null);
      setEditingQuantity("");
    }
  }, [updateLineFormState.message]);

  // Simple selection restoration from localStorage
  React.useEffect(() => {
    console.log("Restoration effect triggered:", {
      inventoryCountingsLength: inventoryCountings.length,
      selectedInventory: selectedInventory?.id,
      selectedInventoryId,
    });

    if (inventoryCountings.length > 0) {
      const savedIdString = localStorageUtils.getString("selectedInventoryId");
      console.log("Saved ID from localStorage:", savedIdString);

      if (savedIdString) {
        try {
          // Convert saved string to BigInt for comparison
          const savedId = BigInt(savedIdString);
          console.log("Converted savedId to BigInt:", savedId);
          console.log(
            "Available inventory IDs:",
            inventoryCountings.map((inv) => inv.id)
          );

          const inventory = inventoryCountings.find((inv) => {
            console.log(
              `Comparing ${
                inv.id
              } (${typeof inv.id}) with ${savedId} (${typeof savedId})`
            );
            return inv.id === savedId;
          });

          if (inventory) {
            console.log("Restoring selection from localStorage:", inventory.id);
            setSelectedInventory(inventory);
            setSelectedInventoryId(inventory.id);
          } else {
            console.log("Inventory not found in data, clearing localStorage");
            localStorageUtils.remove("selectedInventoryId");
          }
        } catch (error) {
          console.error("Error converting savedId to BigInt:", error);
          localStorageUtils.remove("selectedInventoryId");
        }
      }
    }
  }, [inventoryCountings, selectedInventory?.id, selectedInventoryId]);

  // Handle successful line deletion - only close modal, don't touch selection
  React.useEffect(() => {
    if (deleteLineFormState.message) {
      console.log("Line deleted successfully, closing modal");
      setIsDeletingLine(false);
      onDeleteLineClose();
    }
    if (
      deleteLineFormState.errors &&
      Object.keys(deleteLineFormState.errors).length > 0
    ) {
      setIsDeletingLine(false);
    }
  }, [
    deleteLineFormState.message,
    deleteLineFormState.errors,
    onDeleteLineClose,
  ]);

  // Disable find-as-you-type only when not in input fields
  React.useEffect(() => {
    if (editingLine) {
      const preventFind = (e: KeyboardEvent) => {
        // Always allow typing in input fields
        if (e.target && (e.target as HTMLElement).tagName === "INPUT") {
          return;
        }
        // Block find-as-you-type only outside inputs
        if (e.key.length === 1) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("keydown", preventFind, true);
      return () => {
        document.removeEventListener("keydown", preventFind, true);
      };
    }
  }, [editingLine]);

  const handleCancelEdit = () => {
    setEditingLine(null);
    setEditingQuantity("");
  };

  const handleDeleteLine = (line: any) => {
    setLineToDelete(line);
    onDeleteLineOpen();
  };

  const getItemsByFeedType = (feedTypeId: number) => {
    return items.filter((item) => item.feed_type_id === feedTypeId);
  };

  const getBatchesByItem = (itemId: number) => {
    const filteredBatches = batches.filter((batch) => batch.item_id === itemId);

    // Sort by posting date descending (newest first)
    const sortedBatches = filteredBatches.sort((a, b) => {
      const dateA = a.itemtransactions[0]?.documents?.date_time;
      const dateB = b.itemtransactions[0]?.documents?.date_time;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    console.log(`Batches for item ${itemId}:`, sortedBatches);
    console.log("All batches:", batches);
    console.log("Sample batch structure:", batches[0]);
    return sortedBatches;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("uk-UA");
  };

  const getStatusColor = (inventory: any) => {
    return inventory.documents.date_time_posted &&
      inventory.documents.date_time_posted.getTime() ===
        inventory.posting_date_time.getTime()
      ? "success"
      : "warning";
  };

  const getStatusText = (inventory: any) => {
    return inventory.documents.date_time_posted &&
      inventory.documents.date_time_posted.getTime() ===
        inventory.posting_date_time.getTime()
      ? "Проведено"
      : "Чернетка";
  };

  const isDraftStatus = (inventory: any) => {
    return !(
      inventory.documents.date_time_posted &&
      inventory.documents.date_time_posted.getTime() ===
        inventory.posting_date_time.getTime()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Інвентаризація кормів</h1>
        <Button color="primary" onPress={handleCreateInventory}>
          Створити інвентаризацію
        </Button>
      </div>

      {/* Inventory Counting List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Список інвентаризацій</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Inventory counting table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Дата створення</TableColumn>
              <TableColumn>Дата проведення</TableColumn>
              <TableColumn>Виконавець</TableColumn>
              <TableColumn>Статус</TableColumn>
              <TableColumn>Кількість позицій</TableColumn>
              <TableColumn>Дії</TableColumn>
            </TableHeader>
            <TableBody>
              {inventoryCountings.map((inventory) => (
                <TableRow
                  key={inventory.id}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedInventory?.id === inventory.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    console.log("Selecting inventory:", inventory.id);
                    setSelectedInventory(inventory);
                    setSelectedInventoryId(inventory.id);
                    // Save to localStorage
                    localStorageUtils.set("selectedInventoryId", inventory.id);
                    console.log("Saved to localStorage:", inventory.id);
                  }}
                >
                  <TableCell>{inventory.id}</TableCell>
                  <TableCell>
                    {formatDate(inventory.documents.date_time)}
                  </TableCell>
                  <TableCell>
                    {formatDate(inventory.posting_date_time)}
                  </TableCell>
                  <TableCell>
                    {inventory.documents.employees?.individual?.name}{" "}
                    {inventory.documents.employees?.individual?.surname}
                  </TableCell>
                  <TableCell>
                    <Chip color={getStatusColor(inventory)} variant="flat">
                      {getStatusText(inventory)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {inventory.inventory_counting_lines.length}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {getStatusText(inventory) === "Чернетка" && (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            onPress={() => handlePostInventory(inventory)}
                            isDisabled={
                              inventory.inventory_counting_lines.length === 0
                            }
                          >
                            Провести
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onPress={() => {
                              if (
                                inventory.inventory_counting_lines.length === 0
                              ) {
                                // Immediate delete
                                const formData = new FormData();
                                formData.append(
                                  "inventory_counting_id",
                                  inventory.id.toString()
                                );
                                deleteAction(formData);
                              } else {
                                handleDeleteInventory(inventory);
                              }
                            }}
                          >
                            Видалити
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Create Inventory Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Створити інвентаризацію</ModalHeader>
              <ModalBody>
                <form action={createAction} className="space-y-4">
                  <Input
                    type="datetime-local"
                    name="posting_date_time"
                    label="Дата та час проведення"
                    placeholder="дд.мм.рррр --:--"
                    isRequired
                    isInvalid={!!createFormState.errors?.posting_date_time}
                    errorMessage={
                      createFormState.errors?.posting_date_time?.[0]
                    }
                    classNames={{
                      label: "text-foreground",
                      input: "text-foreground",
                      inputWrapper: "bg-default-50",
                    }}
                  />
                  <input type="hidden" name="executed_by" value={3} />

                  {createFormState.errors?._form && (
                    <div className="text-red-500 text-sm">
                      {createFormState.errors._form[0]}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button color="default" onPress={onClose}>
                      Скасувати
                    </Button>
                    <Button color="primary" type="submit">
                      Створити
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Line Modal */}
      <Modal
        isOpen={isAddLineOpen}
        onClose={onAddLineClose}
        placement="top-center"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Додати позицію до інвентаризації</ModalHeader>
              <ModalBody>
                <form
                  action={addLineAction}
                  className="space-y-4"
                  onSubmit={(e) => {
                    const formData = new FormData(e.currentTarget);
                    console.log(
                      "Form submitted with selectedBatch:",
                      selectedBatch
                    );
                    console.log("selectedInventory:", selectedInventory);
                    console.log("selectedInventory.id:", selectedInventory?.id);
                    console.log("Form data entries:");
                    Array.from(formData.entries()).forEach(([key, value]) => {
                      console.log(`${key}: ${value}`);
                    });
                    console.log("All form data:", formData);
                  }}
                >
                  <input
                    type="hidden"
                    name="inventory_counting_id"
                    value={selectedInventory?.id?.toString()}
                  />

                  <Select
                    label="Тип корму"
                    placeholder="Оберіть тип корму"
                    selectedKeys={selectedFeedType ? [selectedFeedType] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setSelectedFeedType(key);
                      setSelectedItem("");
                    }}
                    isRequired
                    isInvalid={!!addLineFormState.errors?.feed_type_id}
                    errorMessage={addLineFormState.errors?.feed_type_id?.[0]}
                  >
                    {feedTypes.map((feedType) => (
                      <SelectItem
                        key={feedType.id.toString()}
                        value={feedType.id.toString()}
                      >
                        {feedType.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Товар"
                    placeholder="Оберіть товар"
                    selectedKeys={selectedItem ? [selectedItem] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setSelectedItem(key);
                      setSelectedBatch("");
                    }}
                    isRequired
                    isDisabled={!selectedFeedType}
                    isInvalid={!!addLineFormState.errors?.item_id}
                    errorMessage={addLineFormState.errors?.item_id?.[0]}
                  >
                    {selectedFeedType
                      ? getItemsByFeedType(parseInt(selectedFeedType)).map(
                          (item) => (
                            <SelectItem
                              key={item.id.toString()}
                              value={item.id.toString()}
                            >
                              {item.name}
                            </SelectItem>
                          )
                        )
                      : []}
                  </Select>
                  <Select
                    label="Партія"
                    placeholder="Оберіть партію"
                    selectedKeys={selectedBatch ? [selectedBatch] : []}
                    onOpenChange={(isOpen) => {
                      if (isOpen) {
                        console.log(
                          "Batch dropdown opened, selectedBatch:",
                          selectedBatch
                        );
                      }
                    }}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      console.log("Selected batch:", key);
                      console.log("Keys array:", Array.from(keys));
                      setSelectedBatch(key);
                    }}
                    isRequired
                    isDisabled={!selectedItem}
                    isInvalid={!!addLineFormState.errors?.batch_id}
                    errorMessage={addLineFormState.errors?.batch_id?.[0]}
                  >
                    {selectedItem
                      ? getBatchesByItem(parseInt(selectedItem)).map(
                          (batch) => (
                            <SelectItem
                              key={batch.id.toString()}
                              value={batch.id.toString()}
                              textValue={`${batch.name || "Без назви"} - ${
                                batch.itemtransactions[0]?.documents?.date_time
                                  ? new Date(
                                      batch.itemtransactions[0].documents.date_time
                                    ).toLocaleDateString("uk-UA")
                                  : "Н/Д"
                              }`}
                            >
                              {batch.name || "Без назви"} -{" "}
                              {batch.itemtransactions[0]?.documents?.date_time
                                ? new Date(
                                    batch.itemtransactions[0].documents.date_time
                                  ).toLocaleDateString("uk-UA")
                                : "Н/Д"}
                            </SelectItem>
                          )
                        )
                      : []}
                  </Select>
                  <Input
                    type="number"
                    name="actual_quantity"
                    label="Фактична кількість"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(e.target.value)}
                    isRequired
                    isInvalid={!!addLineFormState.errors?.actual_quantity}
                    errorMessage={addLineFormState.errors?.actual_quantity?.[0]}
                  />
                  <input
                    type="hidden"
                    name="feed_type_id"
                    value={selectedFeedType}
                  />
                  <input type="hidden" name="item_id" value={selectedItem} />
                  <input type="hidden" name="unit_id" value={2} />
                  <input type="hidden" name="batch_id" value={selectedBatch} />
                  {/* Debug info */}
                  <div style={{ display: "none" }}>
                    Debug: feed_type_id={selectedFeedType}, item_id=
                    {selectedItem}, batch_id={selectedBatch}
                  </div>
                  {/* Default to kg */}
                  {addLineFormState.errors?._form && (
                    <div className="text-red-500 text-sm">
                      {addLineFormState.errors._form[0]}
                    </div>
                  )}
                  {addLineFormState.message && (
                    <div className="text-green-500 text-sm">
                      {addLineFormState.message}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button color="default" onPress={onClose}>
                      Скасувати
                    </Button>
                    <Button color="primary" type="submit">
                      Додати
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Display Lines for Selected Inventory */}
      {selectedInventory && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h3 className="text-lg font-semibold">
                Позиції інвентаризації #{selectedInventory.id}
              </h3>
              <div className="flex gap-2 ml-auto">
                {isDraftStatus(selectedInventory) && (
                  <Button
                    size="sm"
                    color="primary"
                    onPress={() => handleAddLine(selectedInventory)}
                  >
                    Додати позицію
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table aria-label="Inventory lines table">
              <TableHeader>
                <TableColumn>Тип корму</TableColumn>
                <TableColumn>Товар</TableColumn>
                <TableColumn>Партія</TableColumn>
                <TableColumn>Системна кількість</TableColumn>
                <TableColumn>Фактична кількість</TableColumn>
                <TableColumn>Різниця</TableColumn>
                <TableColumn>Одиниця</TableColumn>
                <TableColumn>Дії</TableColumn>
              </TableHeader>
              <TableBody>
                {selectedInventory.inventory_counting_lines.map((line: any) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.feedtypes.name}</TableCell>
                    <TableCell>{line.items.name}</TableCell>
                    <TableCell>
                      ID: {line.itembatches?.id || "Н/Д"} -{" "}
                      {line.itembatches?.name || "Без назви"}
                      {line.itembatches?.itemtransactions?.[0]?.documents
                        ?.date_time && (
                        <div className="text-xs text-gray-500">
                          {new Date(
                            line.itembatches.itemtransactions[0].documents.date_time
                          ).toLocaleDateString("uk-UA")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{line.system_quantity.toFixed(2)}</TableCell>
                    <TableCell>
                      {editingLine?.id === line.id ? (
                        <form
                          action={updateLineAction}
                          className="flex gap-2 items-center"
                        >
                          <input
                            type="hidden"
                            name="line_id"
                            value={editingLine.id.toString()}
                          />
                          <Input
                            type="number"
                            name="actual_quantity"
                            value={editingQuantity}
                            onChange={(e) => setEditingQuantity(e.target.value)}
                            onFocus={(e) => {
                              // Ensure the input maintains focus and selects all text
                              const target = e.target as HTMLInputElement;
                              target.select();
                              // Force focus to stay on this input
                              setTimeout(() => target.focus(), 0);
                            }}
                            onBlur={(e) => {
                              // Prevent blur if we're still editing
                              if (editingLine) {
                                setTimeout(
                                  () => (e.target as HTMLInputElement).focus(),
                                  0
                                );
                              }
                            }}
                            size="sm"
                            className="w-20"
                            step="0.01"
                            min="0"
                            autoFocus
                            spellCheck={false}
                            autoComplete="off"
                            data-no-find="true"
                          />
                          <Button size="sm" color="success" type="submit">
                            Зберегти
                          </Button>
                          <Button
                            size="sm"
                            color="default"
                            onPress={handleCancelEdit}
                          >
                            Скасувати
                          </Button>
                          {updateLineFormState.errors?._form && (
                            <div className="text-red-500 text-xs">
                              {updateLineFormState.errors._form[0]}
                            </div>
                          )}
                          {updateLineFormState.message && (
                            <div className="text-green-500 text-xs">
                              {updateLineFormState.message}
                            </div>
                          )}
                        </form>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{line.actual_quantity.toFixed(2)}</span>
                          {isDraftStatus(selectedInventory) && (
                            <Button
                              size="sm"
                              color="primary"
                              onPress={() => handleEditLine(line)}
                            >
                              Редагувати
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          line.difference > 0
                            ? "success"
                            : line.difference < 0
                            ? "danger"
                            : "default"
                        }
                        variant="flat"
                      >
                        {line.difference > 0 ? "+" : ""}
                        {line.difference.toFixed(2)}
                      </Chip>
                    </TableCell>
                    <TableCell>{line.units.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingLine?.id !== line.id &&
                          isDraftStatus(selectedInventory) && (
                            <Button
                              size="sm"
                              color="danger"
                              onPress={() => handleDeleteLine(line)}
                            >
                              Видалити
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Підтвердження видалення</ModalHeader>
              <ModalBody>
                <p>
                  Ви дійсно хочете видалити інвентаризацію #
                  {inventoryToDelete?.id}?
                </p>
                <p className="text-sm text-gray-600">
                  Ця дія не може бути скасована. Всі позиції інвентаризації
                  будуть видалені.
                </p>
                <form
                  action={deleteAction}
                  className="space-y-4"
                  onSubmit={(e) => {
                    const formData = new FormData(e.currentTarget);
                    console.log(
                      "Delete form submitted with inventory ID:",
                      inventoryToDelete?.id
                    );
                    console.log("Form data entries:");
                    Array.from(formData.entries()).forEach(([key, value]) => {
                      console.log(`${key}: ${value}`);
                    });
                  }}
                >
                  <input
                    type="hidden"
                    name="inventory_counting_id"
                    value={inventoryToDelete?.id?.toString()}
                  />
                  {deleteFormState.errors?._form && (
                    <div className="text-red-500 text-sm">
                      {deleteFormState.errors._form[0]}
                    </div>
                  )}
                  {deleteFormState.message && (
                    <div className="text-green-500 text-sm">
                      {deleteFormState.message}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      color="default"
                      onPress={onClose}
                      isDisabled={isDeletingLine}
                    >
                      Скасувати
                    </Button>
                    <Button
                      color="danger"
                      type="submit"
                      isLoading={isDeletingLine}
                    >
                      {isDeletingLine ? "Видалення..." : "Видалити"}
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Line Confirmation Modal */}
      <Modal
        isOpen={isDeleteLineOpen}
        onClose={onDeleteLineClose}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Підтвердження видалення позиції</ModalHeader>
              <ModalBody>
                <p>
                  Ви дійсно хочете видалити позицію з товаром{" "}
                  {lineToDelete?.items?.name}?
                </p>
                <p className="text-sm text-gray-600">
                  Ця дія не може бути скасована.
                </p>
                <form
                  action={deleteLineAction}
                  className="space-y-4"
                  onSubmit={(e) => {
                    setIsDeletingLine(true);
                    console.log("Form submitted, line ID:", lineToDelete?.id);
                  }}
                >
                  <input
                    type="hidden"
                    name="line_id"
                    value={lineToDelete?.id?.toString()}
                  />
                  {deleteLineFormState.errors?._form && (
                    <div className="text-red-500 text-sm">
                      {deleteLineFormState.errors._form[0]}
                    </div>
                  )}
                  {deleteLineFormState.message && (
                    <div className="text-green-500 text-sm">
                      {deleteLineFormState.message}
                    </div>
                  )}
                  {deleteLineFormState.errors?.line_id && (
                    <div className="text-red-500 text-sm">
                      {deleteLineFormState.errors.line_id[0]}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button color="default" onPress={onClose}>
                      Скасувати
                    </Button>
                    <Button color="danger" type="submit">
                      Видалити
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Post Confirmation Modal */}
      <Modal isOpen={isPostOpen} onClose={onPostClose} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Підтвердження проведення</ModalHeader>
              <ModalBody>
                <p>
                  Ви дійсно хочете провести інвентаризацію #
                  {inventoryToPost?.id}?
                </p>
                <p className="text-sm text-gray-600">
                  Ця дія створить транзакції для коригування залишків та змінить
                  статус на &quot;Проведено&quot;. Після проведення редагування
                  позицій буде неможливим.
                </p>
                <form
                  action={postAction}
                  className="space-y-4"
                  onSubmit={(e) => {
                    const formData = new FormData(e.currentTarget);
                    console.log(
                      "Post form submitted with inventory ID:",
                      inventoryToPost?.id
                    );
                    console.log("Form data entries:");
                    Array.from(formData.entries()).forEach(([key, value]) => {
                      console.log(`${key}: ${value}`);
                    });
                  }}
                >
                  <input
                    type="hidden"
                    name="inventory_counting_id"
                    value={inventoryToPost?.id?.toString()}
                  />
                  {postFormState.errors?._form && (
                    <div className="text-red-500 text-sm">
                      {postFormState.errors._form[0]}
                    </div>
                  )}
                  {postFormState.message && (
                    <div className="text-green-500 text-sm">
                      {postFormState.message}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button color="default" onPress={onClose}>
                      Скасувати
                    </Button>
                    <Button color="success" type="submit">
                      Провести
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
