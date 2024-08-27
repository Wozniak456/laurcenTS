'use client'

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface DeleteItemFormProps{
    item: Item
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

export default function DeleteItemForm({item} : DeleteItemFormProps){
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    const action = actions.deleteItem.bind(null, item.id)
    return(
        <div 
        className=""
        >
            <Button onPress={onOpen} color="danger">Delete</Button>
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex justify-center font-bold my-4">Ви дійсно хочете видалити товар {item.name}?</ModalHeader>
                    <ModalBody>
                        <form className="flex flex-col gap-8" action={action}>
                            <input type="hidden" name="item_id" value={item.id} />
                            <FormButton color="danger">Так, видалити</FormButton>
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