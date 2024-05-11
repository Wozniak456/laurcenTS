'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface PurchLinesComponentProps {
    purchId: bigint | undefined,
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
    }[],
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    // setSelectedLine: React.Dispatch<React.SetStateAction<number | undefined>>
}

export default function CreateEditLineForm({purchId, 
    line, 
    index, 
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
            <h2 className="text-lg font-semibold mb-4">Нова накладна</h2>
            <form className="mb-4" action={action} onSubmit={handleCloseModal}>
            <input type="hidden" name="purchase_id" value={String(purchId)} />
            {line ? <input type="hidden" name="purch_line_id" value={String(line.id)} /> : ''}
            <div className="flex flex-row gap-2 justify-between items-start flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className=" flex items-center gap-2">
                        <label className="" htmlFor='item_id'>
                        Item ID: 
                    </label>
                    <select 
                        name='item_id'
                        className="border rounded p-2 h-10 w-32" 
                        id='item_id'
                        required
                        onChange={(e) => handleSelectedItem(Number(e.target.value)) }
                        defaultValue={line ? line.item_id : undefined}  
                        // value={line ? line.item_id : ''}
                    >
                        <option value="">Оберіть...</option>
                        {items
                            .map(item => (
                                <option key={item.id} value={item.id}>{item.id}</option>
                        ))}
                    </select>
                    </div>
                    <div>
                        {selectedItem ? <p>{selectedItem}</p> : ''}
                    </div>

                </div>
                <div className=" flex items-center gap-2">
                    <label className="" htmlFor='quantity'>
                    Quantity: 
                    </label>
                    <input
                        name='quantity'
                        className="border rounded p-2 w-24 h-10" // Додайте висоту тут
                        id='quantity'
                        required
                        defaultValue={line ? line.quantity : undefined} 
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor='unit_id'>Unit:</label>
                    <input type="hidden" name="unit_id" value={items.find(item => item.name === selectedItem)?.units?.id} />
                    <label className="border rounded p-2 w-24 h-10">{items.find(item => item.name === selectedItem)?.units?.name || ''}</label>
                </div>
            </div> 
            <div className="flex justify-between mt-4">
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