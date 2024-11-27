'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import FormButton from "../common/form-button";

type Item = {
    id: number;
    name: string;
    description: string | null;
    item_type_id: number | null;
    feed_type_id: number | null;
    default_unit_id: number | null;
    parent_item: number | null;
    vendor_id: number | null;
}

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
            items: Item[];
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
   
    
}

export default function CreateEditLineForm({
    purchHeader, 
    line, 
    items, 
    // setShowModal, 
} : PurchLinesComponentProps){

    const [selectedItem, setSelectedItem] = useState<string | undefined>('');

    // useEffect(() => {
    //     console.log('selectedItem: ', selectedItem)
    // }, [selectedItem]);

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
                            {purchHeader 
                                ? purchHeader.vendors.items.map(item => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                    </SelectItem>
                                ))
                                : []  // Передаємо порожній масив, якщо purchHeader не визначений
                            }
 
                        </Select>
                    <Input 
                            name="quantity"
                            label='Кількість:'
                            labelPlacement="outside"
                            placeholder="Кількість:"
                            isRequired
                            type="number"
                            min={0}
                            step="0.01"
                            // isInvalid={!!formState?.errors?.delivery_date}
                            // errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                            defaultValue={line ? line.quantity.toString() : ''}
                        />
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