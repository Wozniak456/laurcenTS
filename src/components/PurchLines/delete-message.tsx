'use client'
import * as actions from '@/actions';
import FormButton from '../common/form-button';

interface PurchLineEditFormProps {
    line: {
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
    // setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PurchLineDeleteForm({line} : PurchLineEditFormProps){

    const deletePurchLineAction = actions.deletePurchLine.bind(null, line.id)

    // const handleCloseModal = () => {
    //     setShowModal(false);
    // };

    return(        
        <div className="p-4">
            {/* <div className="bg-white p-8 rounded shadow-lg w-1/2"> */}
                <h2 className="text-lg font-semibold mb-4">Ви дійсно хочете видалити рядок?</h2>
                <form action={deletePurchLineAction} >
                    <div className="flex justify-end mt-4">
                        {/* <button 
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            type="submit"
                            >
                            Видалити
                        </button> */}

                        <FormButton color="danger">
                            Видалити
                        </FormButton>
                        {/* <button className="hover:bg-blue-500 hover:text-white border font-bold py-2 px-4 rounded" 
                        onClick={handleCloseModal}>
                            Скасувати
                        </button> */}
                    </div>
                </form>
            {/* </div> */}
        </div>
    )
}