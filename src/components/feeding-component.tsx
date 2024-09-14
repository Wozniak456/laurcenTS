'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import PartitionForm from "@/components/batch-partition";
import { useState } from "react";
import { itembatches } from "@prisma/client";
import PoolInfo from "@/components/Pools/pool-info"
import { disposalItem, poolManagingType } from '@/types/app_types'
import DisposalForm from '@/components/Stocking/disposal-form'
import { Input, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import FormButton from "./common/form-button";
import FetchingForm from "./fetching";

import Link from "next/link";

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
    poolInfo: poolManagingType,
    disposal_reasons: disposalItem[],
    weekNum: number
}

export default function StockPoolPage({location, locations, batches, poolInfo, disposal_reasons, weekNum}: StockPoolProps) {
    const [showPartitionForm, setShowPartitionForm] = useState(false);
    const [showDisposalForm, setShowDisposalForm] = useState(false);
    const {isOpen, onOpen, onClose} = useDisclosure();
    
    const [formState, action] = useFormState(actions.stockPool, { message: '' });

    return (
        <div>
            <div className="my-4">
                <h2 className="font-bold">Локація: {location.name}</h2>
            </div> 
            
            {poolInfo.qty && poolInfo.qty > 0 ? <PoolInfo location={location} poolInfo={poolInfo} batches={batches}/> : ''}
            
            <form className="container mx-auto m-4 " action={action}>
                <div className="flex justify-center flex-col gap-4 ">
                    <input type="hidden" name="location_id_from" value={87} />
                    <input type="hidden" name="location_id_to" value={location.id} />
                    {(!poolInfo.batch || poolInfo.qty == 0) && 
                    <div className="flex flex-wrap items-center gap-4 justify-between">
                    <div className='w-full sm:w-1/3'>
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
                        </div>
                        <div className='w-full sm:w-1/4'>
                        <Input 
                            label="Кількість:" 
                            name="fish_amount"
                            type='number'
                            min={1}
                            // isInvalid={!!formState.errors?.quantity}
                            // errorMessage={formState.errors?.quantity}
                            isRequired
                        />
                        </div>
                        <div className='w-full sm:w-1/4'>

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
                        </div>
                    </div>}
                    <div className="flex flex-wrap gap-4 justify-end">
                        {(!poolInfo.batch || poolInfo.qty==0) &&
                        <FormButton color="primary">
                            Зарибити зі складу
                        </FormButton>
                        }

                        {poolInfo.qty && poolInfo.qty > 0 ?
                        <>
                        <Button color="primary" 
                            onClick={() => setShowPartitionForm(!showPartitionForm)}
                        >
                            Розділити
                        </Button>                        

                        <Button onPress={onOpen} color="default">Списати</Button>
                        <Modal 
                            isOpen={isOpen} 
                            // onOpenChange={onOpenChange}
                            onClose={onClose} 
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
        {!poolInfo.batch &&
        <div className="flex justify-end mb-4">
            <Link href={`/pool-managing/${location.id}`}>Актуалізація стану басейна</Link>            
        </div>
        }
        

        {!poolInfo.wasFetchedThisWeek && poolInfo.qty && poolInfo.qty > 0 && 
            <div className="flex justify-end mb-4">
                <FetchingForm location={location} poolInfo={poolInfo} locations={locations} weekNum={weekNum} />
            </div>
        }
        
        
        {showPartitionForm && <PartitionForm location={location} poolInfo={poolInfo} locations={locations}/>} 
        </div>
    );
}