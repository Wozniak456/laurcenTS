'use client'

import { Input, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import FormButton from "./common/form-button";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { useState } from "react";

interface FetchingFormProps{
    location: {
        id: number;
        location_type_id: number;
        name: string;
        pool_id: number | null;
    },
    poolInfo: {
        batch: {
            id: bigint;
            name: string;
        } | undefined;
        qty: number | undefined;
        fishWeight: number | undefined;
        feedType: {
            id: number;
            name: string;
            feedconnection_id: number | null;
        } | null | undefined;
        updateDate: string | undefined;
        allowedToEdit: boolean;
    },
}

export default function FetchingForm({location, poolInfo } : FetchingFormProps) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [formState, action] = useFormState(actions.fishFetching, { message: '' });

    const [amount, setAmount] = useState<number | undefined>(undefined)
    const [averageWeight, setAverageWeight] = useState<number | undefined>(undefined)

    return(
        <div >
        <Button onPress={onOpen} color="default">Вилов</Button>
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            placement="top-center"
            size="2xl"
        >
            <ModalContent className="w-1/2">
            {(onClose) => (
                <>
                <ModalHeader className="flex flex-col gap-1">Вилов</ModalHeader>
                <ModalBody>
                    <form action={action}>
                        <div className="flex gap-4 mb-8 flex-wrap w-full justify-around">
                            <Input
                                label="Басейн:"
                                value={location.name}
                                readOnly // Забороняємо користувачеві змінювати значення
                                className="flex-grow w-full sm:w-auto"
                            />
                            <input
                                type="hidden"
                                name="location_id_from"
                                value={location.id} 
                            />

                            <input
                                type="hidden"
                                name="batch_id"
                                value={Number(poolInfo.batch?.id)} 
                            />

                            <input
                                type="hidden"
                                name="fish_qty_in_location_from"
                                value={poolInfo.qty} 
                            />

                            <input
                                type="hidden"
                                name="average_fish_mass"
                                value={poolInfo.fishWeight} 
                            />

                            <Input 
                                label="Кількість:" 
                                name="fetch_amount"
                                type='number'
                                min={1}
                                max={poolInfo.qty}
                                onChange={(e) => {setAmount(Number(e.target.value))}}
                                // isInvalid={!!formState.errors?.quantity}
                                // errorMessage={formState.errors?.quantity}
                                isRequired
                                className="flex-grow w-full sm:w-auto "
                            />
                            <Input 
                                label="Середня вага:" 
                                name="fish_weight"
                                type='number'
                                min={0.0001}
                                step="any"
                                onChange={(e) => {setAverageWeight(Number(e.target.value))}}
                                // isInvalid={!!formState.errors?.quantity}
                                // errorMessage={formState.errors?.quantity}
                                isRequired
                                className="flex-grow w-full sm:w-auto "
                            />
                            
                        </div>
                        {amount && averageWeight && <p>Загальна вага: {(amount*averageWeight).toFixed(1)}</p>}
                        
                        <div className="flex justify-end">
                        <FormButton color="danger">Забрати з басейна</FormButton>
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
    
    