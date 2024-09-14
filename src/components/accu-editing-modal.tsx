import * as actions from '@/actions'

import React, { useEffect, useState } from 'react';
import { useFormState } from 'react-dom'; // Ensure this is the correct import for your use case
import FormButton from './common/form-button';

interface EditAccumulationProps {
    columns: {
        key: string;
        label: string;
    }[],
    selectedRow: RowData
}

type RowData = {
    key: string;
    location_id: string;
    location_name: string;
    total: number;
    [key: string]: string | number;
  };

interface ItemsState {
    [key: string]: string;
}

export default function EditAccumulation({ columns, selectedRow }: EditAccumulationProps) {
    const [initialValues] = useState<RowData>(selectedRow);

    const [formData, setFormData] = useState<RowData>(selectedRow);

    // Update form state
    const [formState, action] = useFormState(actions.updateAccumulation, { message: '' });
    
    // Handle change event for form fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const updateItem = (key: string, value: string) => {
        setFormData(prevItems => ({ ...prevItems, [key]: value }));
    };

    useEffect(() => {
        console.log("formState changed: ", formData)
    },[formData])

    return (
        <div className="p-4 max-h-[80vh] overflow-y-auto">
            <form action={action}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Location:</label>
                    <input
                        type="text"
                        name="location_name"
                        defaultValue={formData.location_name}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded"
                        disabled
                    />
                    <input type="hidden" name='location_id' value={formData.location_id}/>
                    {/* <input type="hidden" name='batch_id' value={} /> */}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Total:</label>
                    <input
                        type="text"
                        name="total"
                        defaultValue={formData.total}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded"
                        disabled
                    />
                </div>
                
                {columns.map((col) => {
                    if (col.key !== 'location_name' && col.key !== 'total') {
                        return (
                            <div key={col.key} className="mb-4">
                                <label className="block text-sm font-medium mb-1">{col.label}:</label>
                                <input
                                    onChange={(e) => {updateItem(col.key, e.target.value)}}
                                    className="w-full px-2 py-1 border rounded"
                                    defaultValue={formData[col.key]}
                                />
                                
                                { initialValues[col.key] !== formData[col.key] && 
                                <>
                                <input type="hidden" name={`item_${col.key}`} value={formData[col.key]} />
                                <input type="hidden" name={`prev_item_${col.key}`} value={initialValues[col.key]} />
                                </>
                                }

                            </div>
                        );
                    }
                    return null;
                })}

                <div className="flex justify-end gap-2 mt-4">
                    <FormButton color='primary'>
                        Зберегти
                    </FormButton>
                </div>
            </form>
        </div>
    );
}
