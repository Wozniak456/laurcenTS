'use client'
import * as actions from '@/actions';
import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";


interface PurchHeaderEditFormProps {
    header: {
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
    },
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PurchHeaderDeleteForm({header, setShowModal} : PurchHeaderEditFormProps){

    const deletePurchHeaderAction = actions.deletePurchTable.bind(null, header.id)

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return(        
        <div className="p-4">
            {/* <div className="bg-white p-8 rounded shadow-lg w-1/2"> */}
                <h2 className="text-lg font-semibold mb-4">Ви дійсно хочете видалити накладну?</h2>
                <form action={deletePurchHeaderAction} onSubmit={handleCloseModal}>
                    <div className="flex justify-between mt-4">
                        <Button color='danger'
                            type="submit"
                            >
                            Видалити
                        </Button>
                        
                    </div>
                </form>
            {/* </div> */}
        </div>
    )
}