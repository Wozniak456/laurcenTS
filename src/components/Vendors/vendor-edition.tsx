'use client'

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface EditFormProps{
    vendor: {
        id: number;
        name: string;
        description: string | null;
    }
}

export default function EditForm({vendor} : EditFormProps){
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [formState, action] = useFormState(actions.editVendor, {errors: {}});

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
                    <ModalHeader className="flex justify-center font-bold my-4">Редагування постачальника</ModalHeader>
                    <ModalBody>
                        <form className="flex flex-col gap-8" action={action}>
                            <input type="hidden" name="vendor_id" value={vendor.id} />
                            <div >
                                <Input
                                    name="name"
                                    label="Назва постачальника"
                                    labelPlacement="outside"
                                    placeholder="Введіть назву постачальника"
                                    isClearable
                                    fullWidth
                                    defaultValue={vendor.name}
                                    isRequired
                                />
                            </div>

                            <div >
                                <Input
                                name="description"
                                label="Опис"
                                labelPlacement="outside"
                                placeholder="Додайте опис"
                                isClearable
                                defaultValue={vendor.description ? vendor.description : ''}
                                fullWidth
                                />
                            </div>

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