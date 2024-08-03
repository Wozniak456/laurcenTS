'use client'
import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import { BatchWithCreationInfo } from '@/types/app_types'
import Image from 'next/image';
import CloseButton from '../../../public/icons/close-square-light.svg'
import FormButton from '../common/form-button';

interface BatchDeleteFormProps {
    batch: BatchWithCreationInfo,
    // setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BatchDeleteForm({batch} : BatchDeleteFormProps){
    const [formState, action] = useFormState(actions.deleteItemBatch, {message: ''});
    // const [UpdateActionState, UpdateAction] = useFormState(actions.updateBatches, {message: ''});

    return(        
        // <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-lg font-semibold mb-4">Ви дійсно хочете видалити партію {batch.name}?</h2>
                    {/* <form action={UpdateAction} className='flex justify-end'> 
                        <button 
                            type="submit" 
                            className="rounded p-2 hover:bg-red-200"
                            >
                            <Image src={CloseButton} alt='Close Button'/>
                        </button>
                    </form> */}
                </div> 
                <form action={action} className=''>
                    <input type="hidden" name="batch_id" value={String(batch.id)} /> 
                    <input type="hidden" name="create_doc_id" value={String(batch.docId)} />  
                    <div className="flex justify-end flex-wrap">
                                                   
                        <FormButton color='danger'>
                            Видалити
                        </FormButton>
                    </div>
                </form>
                {
                    formState && formState.message ? (
                        <div className={`my-2 p-2 border rounded ${formState.message.includes('Партію видалено!') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                            {formState.message}
                        </div>
                    ) : null
                }
            </div>
        // </div>
    )
}