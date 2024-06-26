'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

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
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    // setSelectedLine: React.Dispatch<React.SetStateAction<number | undefined>>
}

export default function CreateEditLineForm({purchHeader, 
    line, 
    items, 
    setShowModal, 
} : PurchLinesComponentProps){

    const [selectedItem, setSelectedItem] = useState<string | undefined>('');

    useEffect(() => {
        if (line) {
            setSelectedItem(items.find(item => item.id === line.item_id)?.name);
        }
    }, [line, items]);

    const [formState, action] = useFormState(line ? actions.editPurchline : actions.createPurchLineRecord, { message: '' });
    
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem('')
        // setSelectedLine(undefined)
    };

    const handleSelectedItem = (item_id: number) => {
        const name = items.find(item => item.id === item_id)?.name
        setSelectedItem(name)
    };

    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
        <div className="bg-white p-8 rounded shadow-lg w-1/2">
            <h2 className="text-lg font-semibold mb-4">Новий рядок накладної</h2>
            <form className="my-8" action={action} onSubmit={handleCloseModal}>
                <input type="hidden" name="purchase_id" value={String(purchHeader?.id)} />
                {line ? <input type="hidden" name="purch_line_id" value={String(line.id)} /> : ''}
                <div className="flex flex-row gap-2 justify-between items-start flex-wrap">
                    <div className="flex flex-col gap-2 w-full max-w-64">
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

                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-48">
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
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-48">
                        <label htmlFor='unit_id'>Одиниця виміру:</label>
                        <input type="hidden" name="unit_id" value={items.find(item => item.name === selectedItem)?.units?.id} />
                        <label className="border rounded p-2  h-10">{items.find(item => item.name === selectedItem)?.units?.name || ''}</label>
                    </div>
                </div> 
                <div className="flex flex-wrap gap-2 justify-between mt-4">
                    <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                        >
                        Зберегти
                    </button>
                    <button className="hover:bg-blue-500 hover:text-white border font-bold py-2 px-4 rounded" 
                    onClick={handleCloseModal}>
                        Скасувати
                    </button>
                </div>
            </form>
            
        </div>
    </div>
    )
}