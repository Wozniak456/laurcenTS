'use client'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import * as actions from '@/actions';
import { useFormState } from "react-dom";
import {Select, SelectItem} from "@nextui-org/react";
import { useState } from "react";

type Vendor = {
    id: number;
    name: string;
    description: string | null;
};

type FeedType = {
    id: number;
    name: string;
    feedconnection_id: number | null;
}

type NewItemProps = {
    vendor: Vendor | undefined;
    feedTypes : FeedType[]
};

export default function NewItem({vendor, feedTypes} : NewItemProps){
    const [inputValue, setInputValue] = useState("");
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>(undefined);
    const [customOptions, setCustomOptions] = useState<FeedType[]>(feedTypes);
    const [error, setError] = useState<string | null>(null);

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [formState, action] = useFormState(actions.createItem, {errors: {}});

    const handleOptionSelect = (value: string) => {
        setSelectedValue(value);
        setError(null); // Скинути помилку при виборі
      };
    
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (e.target.value.trim() !== '') {
          setSelectedValue(undefined); // Скинути вибір при введенні тексту
          setError(null);
        }
      };
    
      const handleSubmit = () => {
        if (!selectedValue && !inputValue.trim()) {
          setError('Будь ласка, виберіть тип корму або введіть новий тип.');
          return;
        }
    
        // Обробка форми
        console.log('Selected Value:', selectedValue);
        console.log('Input Value:', inputValue);
        // handleClose()
      };
    
      const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && inputValue) {
          const newOption: FeedType = { 
            id: Date.now(), 
            name: inputValue, 
            feedconnection_id: null // або будь-яке значення, яке вам потрібно 
          };
          setCustomOptions([...customOptions, newOption]);
          setSelectedValue(newOption.id);
          setInputValue("");
        }
      };

      const handleClose = () => {
        // Очищення значення inputValue при закритті
        setInputValue('')
      };

    return(
        <div>
            <div className="my-4 flex justify-end">
                <Button onPress={onOpen} color="primary">Новий товар</Button>
            </div>

            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                // onOpenChange={(open) => open && onOpenChange} // Оновлення стану модального вікна
                placement="top-center"
                onClose={handleClose}
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex justify-center font-bold my-4">Додавання нового товару від постачальника {vendor?.name}</ModalHeader>
                    <ModalBody>
                        <form 
                            className="flex flex-col gap-8" 
                            action={action}
                            onSubmit={handleSubmit}
                        >
                            <Input
                                name="name"
                                label="Назва товару"
                                labelPlacement="outside"
                                placeholder="Введіть назву товару"
                                isClearable
                                isRequired
                                fullWidth
                            />
                            <Select
                                label="Виберіть тип корму"
                                name="feed_type_id"
                                isRequired
                            >
                                {feedTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                </SelectItem>
                                ))}
                            </Select>
                            <Input
                                name="description"
                                label="Опис товару"
                                labelPlacement="outside"
                                placeholder="Введіть опис товару"
                                isClearable
                                fullWidth
                            />
                            {/* item_type_id = 3 - корм */}
                            <input type="hidden" name="item_type_id" value={3} />
                       
                            {/* default_unit_id = 2 - кг */}
                            <input type="hidden" name="default_unit_id" value={2} />
                            <input type="hidden" name="vendor_id" value={vendor?.id} />
      

                            <div className="w-full flex justify-end">
                                <FormButton color="primary">Додати</FormButton>
                            </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        
                    </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
        </div>
    )
}