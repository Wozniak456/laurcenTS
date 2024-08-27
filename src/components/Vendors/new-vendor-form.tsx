'use client'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import * as actions from '@/actions';
import { useFormState } from "react-dom";

export default function NewVendor(){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [formState, action] = useFormState(actions.createVendor, {errors: {}});


    return(
        <div>
            <div className="my-4 flex justify-end">
                <Button onPress={onOpen} color="primary">Новий постачальник</Button>
            </div>

            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex justify-center font-bold my-4">Створення нового постачальника</ModalHeader>
                    <ModalBody>
                        <form className="flex flex-col gap-8" action={action}>
                            <div >
                                <Input
                                name="name"
                                label="Назва постачальника"
                                labelPlacement="outside"
                                placeholder="Введіть назву постачальника"
                                isClearable
                                fullWidth
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
                                fullWidth
                                />
                            </div>

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