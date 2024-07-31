'use client'
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { customers } from "@prisma/client";
import Image from 'next/image';
import CloseButton from '../../../public/icons/close-square-light.svg'

interface CreateEditSalesHeaderFormProps{
    customers: customers[]
}

export default function CreateEditSalesHeaderForm({
    customers
} : CreateEditSalesHeaderFormProps){
    // const [formState, action] = useFormState(actions.createSalesTableRecord, { message: '' });
    // const [UpdateActionState, UpdateAction] = useFormState(actions.updateSalesTable, {message: ''});

    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-1/3">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-lg font-semibold text-center">Нова видаткова накладна</h2>
                    {/* <form action={UpdateAction} className='flex justify-end'> 
                        <button 
                            type="submit" 
                            className="rounded p-2 hover:bg-red-200"
                            >
                            <Image src={CloseButton} alt='Close Button'/>
                        </button>
                    </form> */}
                    
                </div>
                <form className="my-4" >
                    <div className="flex flex-wrap gap-2 justify-between items-start">
                        <div className=" flex flex-col gap-2">
                            <label className="" htmlFor='delivery_date'>
                                Дата відвантаження: 
                            </label>
                            <input
                                name='delivery_date'
                                type="date"
                                className="border rounded p-2 h-10" // Додайте висоту тут
                                id='delivery_date'
                                required
                                // defaultValue={header ? header.date_time.toISOString().split("T")[0] : ''}
                            />
                        </div>
                        <div className=" flex flex-col gap-2">
                            <label className="" htmlFor='customer_id'>
                                Замовник:
                            </label>
                            <select 
                                name='customer_id'
                                className="border rounded p-2 h-10 " 
                                id='customer_id'
                                required
                                // onChange={(e) => handleSelectedVendor(Number(e.target.value)) }  
                                // defaultValue={header ? header?.vendor_id : undefined}
                            >
                                <option value="">Оберіть...</option>
                                {customers
                                    .map(customer => (
                                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div> 
                    </div>
                    {/* <input type="hidden" name="header_id" value={String(header?.id)} />  */}
                    <div className="flex justify-between flex-wrap mt-4 gap-2">
                        <button 
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            type="submit"
                            >
                            Зберегти
                        </button>
                        
                    </div>
                </form>
                {/* {
                    formState && formState.message ? (
                        <div className={`my-2 p-2 border rounded ${formState.message.includes('успішно') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                            {formState.message}
                        </div>
                    ) : null
                } */}
                
            </div>
        </div>
    )
}