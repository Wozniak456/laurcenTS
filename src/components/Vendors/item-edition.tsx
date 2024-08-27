'use client'

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spacer, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface EditFormProps{
    item : Item
    feedTypes: FeedType[]
    // vendor: Vendor
}

type FeedType = {
    id: number;
    name: string;
    feedconnection_id: number | null;
}

type Item = {
    id: number;
    name: string;
    description: string | null;
    item_type_id: number | null;
    feed_type_id: number | null;
    default_unit_id: number | null;
    parent_item: number | null;
    vendor_id: number | null;
}

export default function EditItemForm({item, feedTypes} : EditFormProps){
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [formState, action] = useFormState(actions.editItem, {errors: {}});

    return(
        <div 
        className=""
        >
            <Button onPress={onOpen} color="primary">Edit</Button>
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex justify-center font-bold my-4">Редагування товару</ModalHeader>
                    <ModalBody>
                        <form className="flex flex-col gap-8" action={action}>
                        <input type="hidden" name="item_id" value={item.id} />
                            <Input
                                name="name"
                                label="Назва товару"
                                labelPlacement="outside"
                                placeholder="Введіть назву товару"
                                isClearable
                                isRequired
                                fullWidth
                                defaultValue={item.name}
                            />
                            <Select
                                label="Виберіть тип корму"
                                name="feed_type_id"
                                isRequired
                                defaultSelectedKeys={item.feed_type_id ? [item.feed_type_id.toString()] : undefined}
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
                                defaultValue={item.description || ''}
                            />
                            {/* item_type_id = 3 - корм */}
                            <input type="hidden" name="item_type_id" value={item.item_type_id || ''} />
                       
                            {/* default_unit_id = 2 - кг */}
                            <input type="hidden" name="default_unit_id" value={item.default_unit_id || ''} />
                            <input type="hidden" name="vendor_id" value={item.vendor_id || ''} />

                            <div className="w-full flex justify-end">
                                <FormButton color="primary">Оновити</FormButton>
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