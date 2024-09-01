'use client'

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import * as actions from '@/actions';
import { useFormState } from "react-dom";

export default function ActualizationPage(){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return(
        <div>
            <div className="">
                <Button onPress={onOpen} color="default">Актуалізація стану</Button>
            </div>

            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex justify-center font-bold my-4">Актуалізація стану басейна</ModalHeader>
                    <ModalBody>
                        <form className="flex flex-col gap-8">
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