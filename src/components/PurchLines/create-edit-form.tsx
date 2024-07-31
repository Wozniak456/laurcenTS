'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import FormButton from "../common/form-button";

interface PurchLinesComponentProps {
    purchHeader: {
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
    } | undefined,
    line?: {
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
    },
    index?: number,
    items: {
        id: number;
        name: string;
        units: {
            id: number;
            name: string;
        } | null;
        vendor_id: number | null;
    }[],
   
    // setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    // setSelectedLine: React.Dispatch<React.SetStateAction<number | undefined>>
}

export default function CreateEditLineForm({
    purchHeader, 
    line, 
    items, 
    // setShowModal, 
} : PurchLinesComponentProps){

    const [selectedItem, setSelectedItem] = useState<string | undefined>('');

    useEffect(() => {
        console.log('selectedItem: ', selectedItem)
    }, [selectedItem]);

    const [formState, action] = useFormState(line ? actions.editPurchline : actions.createPurchLine, { message: '' });
    
    const handleCloseModal = () => {
        // setShowModal(false);
        setSelectedItem('')
        // setSelectedLine(undefined)
    };

    const handleSelectedItem = (item_id: number) => {
        const name = items.find(item => item.id === item_id)?.name
        setSelectedItem(name)
    };

    return(
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Новий рядок накладної</h2>
            <form className="my-8" action={action} onSubmit={handleCloseModal}>
                <input type="hidden" name="purchase_id" value={String(purchHeader?.id)} />
                {line ? <input type="hidden" name="purch_line_id" value={String(line.id)} /> : ''}
                <div className="flex flex-row gap-2 justify-between items-start flex-wrap">
                    {/* <div className="flex flex-col gap-2 w-full max-w-64">
                        <label className="" htmlFor='item_id'>
                            Призначення: 
                        </label>
                        <select 
                            name='item_id'
                            className="border rounded p-2 h-10" 
                            id='item_id'
                            required
                            onChange={(e) => handleSelectedItem(Number(e.target.value)) }
                            defaultValue={line ? line.item_id : undefined}  
                            // value={line ? line.item_id : ''}
                        >
                            <option value="">Оберіть...</option>
                            {items
                            .filter(item => item.vendor_id == purchHeader?.vendor_id)
                            .map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>

                    </div> */}
                    <Select 
                            label="Призначення:" 
                            name="item_id"
                            labelPlacement="outside"
                            placeholder="Призначення:"
                            isRequired
                            // isInvalid={!!formState?.errors?.vendor_id}
                            // errorMessage={formState?.errors?.vendor_id?.join(', ')}
                            onChange={(e) => handleSelectedItem(Number(e.target.value)) }
                            defaultSelectedKeys={
                                line && line.items && line.items.name ? 
                                [items.filter(item => item.name === line.items.name).map(item => String(item.id))[0]]
                                : undefined
                            }
                        >
                            {items.map(item => (
                                <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                            ))}
                        </Select>
                    {/* <Select 
                        label="Призначення:" 
                        name="item_id"
                        labelPlacement="outside"
                        placeholder="Призначення:"
                        isRequired
                        defaultSelectedKeys={line && line.item_id ? [line.item_id] : []}
                    >
                        {items.map(item => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                    </Select> */}

                    {/* <div className="flex flex-col gap-2 w-full max-w-48">
                        <label className="" htmlFor='quantity'>
                            Кількість: 
                        </label>
                        <input
                            name='quantity'
                            className="border rounded p-2 h-10" // Додайте висоту тут
                            id='quantity'
                            required
                            type="number"
                            min={1}
                            defaultValue={line ? line.quantity : undefined} 
                        />
                    </div> */}
                    <Input 
                            name="quantity"
                            label='Кількість:'
                            labelPlacement="outside"
                            placeholder="Кількість:"
                            isRequired
                            // isInvalid={!!formState?.errors?.delivery_date}
                            // errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                            defaultValue={line ? line.quantity.toString() : ''}
                        />
                    {/* <div className="flex flex-col gap-2 w-full max-w-48"> 
                        <label htmlFor='unit_id'>Одиниця виміру:</label>
                        
                        <label className="border rounded p-2  h-10">{items.find(item => item.name === selectedItem)?.units?.name || ''}</label>
                    </div> */}
                    <Input 
                        name="unit_id"
                        label='Одиниця виміру:'
                        labelPlacement="outside"
                        placeholder="Одиниця виміру:"
                        isRequired
                        value={`${line ? line.units.name : selectedItem ? items.find(item => item.name === selectedItem)?.units?.name : ''}`}
                        disabled
                        // isInvalid={!!formState?.errors?.delivery_date}
                        // errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                        
                    />
                    <input type="hidden" name="unit_id" value={line ? line.units.id : items.find(item => item.name === selectedItem)?.units?.id} />
                </div> 
                <div className="flex flex-wrap gap-2 justify-end mt-4">
                    <FormButton color="primary">
                        Зберегти
                    </FormButton>
                </div>
            </form>
            
        {/* </div> */}
    </div>
    )
}