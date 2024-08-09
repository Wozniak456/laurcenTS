'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import FormButton from "../common/form-button";

interface PurchHeaderComponentProps{
    header?: {
        id: bigint;
        doc_id: bigint | null;
        date_time: Date;
        vendor_id: number;
        vendor_doc_number: string;
        vendors: {
            id: number;
            name: string;
            description: string | null;
        };
        purchaselines: {
            id: number;
            items: {
                id: number;
                name: string;
                feed_type_id: number | null;
            };
            quantity: number;
            units: {
                id: number;
                name: string;
            };
            item_id: number;
        }[];
    }
    vendors: {
        id: number;
        name: string;
        description: string | null;
    }[],
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateEditPurchHeaderForm({
    header,
    vendors,
    setShowForm: setShowCreatePurchHeaderModal
} : PurchHeaderComponentProps){

    const [selectedVendor, setSelectedVendor] = useState<string | undefined>('');

    const handleCloseModal = () => {
        setSelectedVendor('')
        setShowCreatePurchHeaderModal(false);
    };

    const handleSelectedVendor = (vendor_id: number) => {
        const name = vendors.find(vendor => vendor.id === vendor_id)?.name
        
        setSelectedVendor(name)
    };

    const [formState, action] = useFormState(header ? actions.editPurchtable : actions.createPurchTable, { errors: {} });

    useEffect(() => {
        console.log('header changed, ', header)
    }, [header])
    return(
        <div className="w-full">
            {/* <div className="bg-white p-8 rounded shadow-lg w-2/3"> */}
                {header ? <h2 className="text-lg font-semibold m-4">Редагування накладної</h2> : <h2 className="text-lg font-semibold m-4">Нова накладна</h2>}
         
                <form className="m-4" action={action} onSubmit={handleCloseModal}>
                    <div className="flex flex-row flex-wrap gap-4 justify-between items-start my-8">
                       
                        <Input 
                            name="delivery_date"
                            label='Дата приходу:'
                            labelPlacement="outside"
                            placeholder="Дата приходу:"
                            type="date"
                            isRequired
                            isInvalid={!!formState?.errors?.delivery_date}
                            errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                            defaultValue={header ? header.date_time.toISOString().split("T")[0] : ''}
                        />
                        
                        <Select 
                            label="Постачальник:" 
                            name="vendor_id"
                            labelPlacement="outside"
                            placeholder="Постачальник:"
                            isRequired
                            isInvalid={!!formState?.errors?.vendor_id}
                            errorMessage={formState?.errors?.vendor_id?.join(', ')}
                            defaultSelectedKeys={
                                header && header.vendors && header.vendors.name ? 
                                [vendors.filter(vendor => vendor.name === header.vendors.name).map(vendor => String(vendor.id))[0]]
                                : undefined
                            }
                        >
                            {vendors.map(vendor => (
                                <SelectItem key={vendor.id} value={String(vendor.id)}>{vendor.name}</SelectItem>
                            ))}
                        </Select>

                        <Input 
                            name="vendor_doc_id"
                            label='Документ постачальника:'
                            labelPlacement="outside"
                            placeholder="Номер документа:"
                            isInvalid={!!formState?.errors?.vendor_doc_number}
                            errorMessage={formState?.errors?.vendor_doc_number?.join(', ')}
                            isRequired
                            defaultValue={header ? header.vendor_doc_number : undefined}
                        />
                        
                    </div>
                    
                    <input type="hidden" name="header_id" value={String(header?.id)} /> 
                    
                    {formState?.errors._form ? <div className="rounded p-2 bg-red-200 border border-red-200">{formState.errors._form.join(', ')}</div> : null}
                    
                    <div className="flex justify-end mt-4">
                        <FormButton color="primary">Зберегти</FormButton>
                    </div>
                </form>
                
            {/* </div> */}
        </div>
    )
}