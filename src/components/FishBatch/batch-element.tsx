'use client'
import * as actions from '@/actions'
import { useFormState } from "react-dom";
import Image from 'next/image';
import CloseButton from '../../../public/icons/close-square-light.svg'
import { BatchWithCreationInfo } from '@/types/app_types'
import { ChangeEvent, useState } from 'react';
import BatchDeleteForm from '@/components/FishBatch/delete-message'

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Checkbox, Link} from "@nextui-org/react";


import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import FormButton from '../common/form-button';

type ItemBatchComponentProps = {
    batch: BatchWithCreationInfo,
    items: {
        id: number;
        name: string;
    }[]
}
export default function ItemBatchComponent({
    batch,
    items
} : ItemBatchComponentProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [allowToEdit, setAllowToEdit] = useState<boolean>(false);
    const [UpdateActionState, UpdateAction] = useFormState(actions.updateBatches, {message: ''});
    const [updateBatchActionState, updateBatchAction] = useFormState(actions.editItemBatch, {message: ''});
    const [showDeleteMessage, setShowDeleteMessage ] = useState<boolean>(false)

    const handleAlloEditButton = () => {
        setAllowToEdit(!allowToEdit)
    }

    const handleDeleteButton = () => {
        setShowDeleteMessage(!showDeleteMessage)
    }

    const [itemId, setItemId] = useState<number | undefined | ''>('');
    const [date, setDate] = useState<Date | null| undefined | ''>('');
    const [qty, setQty] = useState<number | undefined | ''>('');
    
    const handleInputItemIdChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setItemId(Number(event.target.value));
    };

    const handleInputDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const date = new Date(event.target.value)
        setDate(date);
    };

    const handleInputQtyChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQty(Number(event.target.value));
    };
    
    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-400 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-2/5">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-lg font-semibold text-center">Партія {batch.name}</h2>
                    <form action={UpdateAction} className='flex justify-end'> 
                        <FormButton color='default'>
                            <Image src={CloseButton} alt='Close Button'/>
                        </FormButton>
                    </form>
                </div>
                <div className="flex flex-col gap-4">
                    <form className='flex flex-col gap-2'>
                        <div className="flex gap-4 flex-wrap items-center">
                            <label className="w-40" htmlFor="item_id">
                                Призначення партії:
                            </label> 
                            <select
                                name="item_id"
                                className="border rounded p-2 flex-grow min-w-32"
                                id="item_id"
                                defaultValue={batch.items ? batch.items.id : ''}
                                onChange={handleInputItemIdChange}
                                disabled={!allowToEdit}
                                required
                            >
                                {items.map(item => (
                                    <option 
                                    key={item.id} 
                                    value={item.id}
                                    >{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4 flex-wrap items-center">
                            <label className="w-40" htmlFor="created">
                                Дата створення:
                            </label>
                            <input 
                                name="created"
                                className="border rounded p-2 flex-grow min-w-32"
                                type="date"
                                id="created"
                                defaultValue={batch.created ? batch.created.toISOString().split("T")[0] : ''}
                                disabled={!allowToEdit}
                                onChange={handleInputDateChange}
                                required
                            />
                        </div>
                        <div className="flex gap-4 flex-wrap items-center">
                            <label className="w-40" htmlFor="quantity">
                                Кількість:
                            </label>
                            <input 
                                name="quantity"
                                className="border rounded p-2 flex-grow min-w-32"
                                id="quantity"
                                defaultValue={batch.quantity}
                                onChange={handleInputQtyChange}
                                disabled={!allowToEdit}
                                type="number"
                                min={1}
                                required
                            />
                        </div>
                    </form>
                    {batch.isNew ?
                    <div className="flex gap-4 justify-between flex-wrap">
                    {!allowToEdit && 
                        // <button 
                        //     className="p-2 border rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 min-w-64"
                        //     onClick={handleAlloEditButton}>
                        //         <p>Увімкнути редагування</p>
                        // </button>

                        <Button color='default' onClick={handleAlloEditButton}>
                            Увімкнути редагування
                        </Button>
                        
                        } 


                        {allowToEdit && 
                        <form action={updateBatchAction}>
                            <input type="hidden" name="batch_id" value={String(batch.id)} /> 
                            <input type="hidden" name="item_id" value={String(itemId)} /> 
                            <input type="hidden" name="date" value={String(date)} /> 
                            <input type="hidden" name="qty" value={String(qty)} />
                            <input type="hidden" name="doc_id" value={String(batch.docId)} />
                            <input type="hidden" name="tran_id" value={String(batch.tranId)} />

                            {/* <button 
                                className="p-2 border rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200  min-w-64"
                                type='submit'
                            >
                                <p>Зберегти</p>
                            </button> */}

                            <FormButton color='primary'>
                                Зберегти
                            </FormButton>

                        </form>
                        }
                            {/* <button 
                            type="submit" 
                            className="p-2 border rounded bg-red-500 text-white hover:bg-red-600 transition-colors duration-200  min-w-64"
                            onClick={handleDeleteButton}>
                                Видалити партію
                            </button> */}

                    <Button onPress={onOpen} color="danger">Видалити партію</Button>
                        <Modal 
                            isOpen={isOpen} 
                            onOpenChange={onOpenChange}
                            placement="top-center"
                        >
                            <ModalContent>
                            {(onClose) => (
                                <>
                                <ModalHeader className="flex flex-col gap-1"></ModalHeader>
                                <ModalBody>
                                    <BatchDeleteForm batch={batch} />
                                </ModalBody>
                                <ModalFooter>
                                    
                                </ModalFooter>
                                </>
                            )}
                            </ModalContent>
                        </Modal>
                    </div> : <p className='text-gray-500 mt-4 text-center'>* Партія вже задіяна у транзакціях, тому редагування чи видалення недоступне</p>}
                </div>
                    {/* {showDeleteMessage && <BatchDeleteForm batch={batch} />} */}
                    {
                        updateBatchActionState && updateBatchActionState.message ? (
                            <div className={`my-2 p-2 border rounded ${updateBatchActionState.message.includes('Оновлено!') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                                {updateBatchActionState.message}
                            </div>
                        ) : null
                    }
            </div>
        </div>
    )
}