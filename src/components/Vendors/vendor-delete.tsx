'use client'

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface DeleteFormProps{
    vendor: {
        id: number;
        name: string;
        description: string | null;
    }
}

export default function DeleteForm({vendor} : DeleteFormProps){
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    // const [formState, action] = useFormState(actions.deleteVendor, {errors: {}});
    const action = actions.deleteVendor.bind(null, vendor.id)
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
                    <ModalHeader className="flex justify-center font-bold my-4">Ви дійсно хочете видалити постачальника {vendor.name}?</ModalHeader>
                    <ModalBody>
                        <form className="flex flex-col gap-8" action={action}>
                            <input type="hidden" name="vendor_id" value={vendor.id} />
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