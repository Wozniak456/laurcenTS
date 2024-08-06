'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import PartitionForm from "@/components/batch-partition";
import { useState } from "react";
import { itembatches } from "@prisma/client";
import PoolInfo from "@/components/Pools/pool-info"
import { disposalItem } from '@/types/app_types'
import DisposalForm from '@/components/Stocking/disposal-form'
import { Input, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import FormButton from "./common/form-button";

interface StockPoolProps {
    locations: {
        id: number,
        name: string,
        location_type_id: number
    }[],
    location: {
        id: number;
        location_type_id: number;
        name: string;
        pool_id: number | null;
    },
    batches: itembatches[],
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
    disposal_reasons: disposalItem[]
}

export default function StockPoolPage({location, locations, batches, poolInfo, disposal_reasons}: StockPoolProps) {
    const [showPartitionForm, setShowPartitionForm] = useState(false);
    const [showDisposalForm, setShowDisposalForm] = useState(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    const handleDisposalFormButton = () => {
        setShowDisposalForm(true)
    }

    
    const [formState, action] = useFormState(actions.stockPool, { message: '' });

    return (
        <div>
            <div className="my-4">
                <h2 className="font-bold">Локація: {location.name}</h2>
            </div> 
            
            {poolInfo.qty && poolInfo.qty > 0 ? <PoolInfo location={location} poolInfo={poolInfo} batches={batches}/> : ''}
            
            <form className="container mx-auto m-4 " action={action}>
            <div className="flex justify-end">
            </div>
            <div className="flex justify-center flex-col gap-4 ">
                
                <input type="hidden" name="location_id_from" value={87} />
                <input type="hidden" name="location_id_to" value={location.id} />
                {(!poolInfo.batch || poolInfo.qty == 0) && 
                <div className="flex flex-wrap items-center gap-4 justify-between">
                  
                    <Select 
                        label="Партія" 
                        name="batch_id"
                        // isInvalid={!!formState.errors?.unit_id}
                        // errorMessage={formState.errors?.unit_id}
                        isRequired
                        // placeholder="Партія" 
                    >
                        {batches.map(batch => (
                            <SelectItem key={Number(batch.id)} value={Number(batch.id)}>{batch.name}</SelectItem>
                        ))}
                    </Select>
                    <Input 
                        label="Кількість:" 
                        name="fish_amount"
                        type='number'
                        min={1}
                        // isInvalid={!!formState.errors?.quantity}
                        // errorMessage={formState.errors?.quantity}
                        isRequired
                    />

                    <Input 
                        label="Сер. вага, г" 
                        name="average_fish_mass"
                        type='number'
                        min={0.0001}
                        step="any"
                        // isInvalid={!!formState.errors?.quantity}
                        // errorMessage={formState.errors?.quantity}
                        isRequired
                    />
                </div>}
                <div className="flex flex-wrap gap-4 justify-end">
                    {(!poolInfo.batch || poolInfo.qty==0) &&
                    <FormButton color="primary">
                        Зарибити зі складу
                    </FormButton>
                        // <button
                        //     type="submit"
                        //     className="rounded p-2 bg-blue-200"
                        // >
                        //     Зарибити зі складу
                        // </button>

                    }
                    {poolInfo.qty && poolInfo.qty > 0 ?
                    <>
                    {/* <button
                        type="button"
                        className="rounded p-2 bg-blue-200"
                        onClick={() => setShowPartitionForm(!showPartitionForm)}
                    >
                        Розділити
                    </button> */}
                    <Button color="primary" 
                        onClick={() => setShowPartitionForm(!showPartitionForm)}
                    >
                        Розділити
                    </Button>

                    {/* <button
                        type="button"
                        className="rounded p-2 bg-blue-200"
                        onClick={handleDisposalFormButton}
                    >
                        Списати
                    </button> */}
                    {/* <Button color="default" onClick={handleDisposalFormButton}>
                        Списати
                    </Button> */}

                    <Button onPress={onOpen} color="default">Списати</Button>
                    <Modal 
                        isOpen={isOpen} 
                        onOpenChange={onOpenChange}
                        placement="top-center"
                    >
                        <ModalContent>
                        {(onClose) => (
                            <>
                            <ModalHeader className="flex flex-col gap-1">Списання</ModalHeader>
                            <ModalBody>
                                <DisposalForm location={location} poolInfo={poolInfo} reasons={disposal_reasons} setShowDisposalForm={setShowDisposalForm}/>
                            </ModalBody>
                            <ModalFooter>
                                
                            </ModalFooter>
                            </>
                        )}
                        </ModalContent>
                    </Modal>
                    </> : ''
                    }
                    
                    
                </div>
                
                {formState && formState.message && (
                    <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
                        {formState.message}
                    </div>
                )}
            </div>
            
        </form>
        {showPartitionForm && <PartitionForm location={location} poolInfo={poolInfo} locations={locations}/>} 
        {/* {showDisposalForm && <DisposalForm location={location} poolInfo={poolInfo} reasons={disposal_reasons} setShowDisposalForm={setShowDisposalForm}/>} */}
        </div>
    );
}