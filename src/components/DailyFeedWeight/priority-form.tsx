'use client'
import { useFormState } from 'react-dom';
import * as actions from '@/actions';
import { calculationAndFeedExtended } from '@/types/app_types'

type subRow = {
    qty?: number,
    feed: {
        id?: number,
        name?: string
    },
    item: {
        id?: number,
        name?: string
    }
}

type PriorityFormType = {
    location?: {
        id: number;
        name: string;
    };
    items: {
        id: number;
        name: string;
        feedtypes: {
            id: number;
            name: string;
        } | null;
    }[],
    item?: subRow;
}

export default function PriorityForm(props: PriorityFormType) {
    // console.log('props.item?.feed.id', props.item?.item.name)

    const priority = props.item?.item.id

    // function handleCloseModal() {
    //     setShowForm(prev => !prev);
    // }

    const [formState, action] = useFormState(actions.managePriorities, { message: '' });

    return (
        <div className="">
            <h2 className="text-lg font-semibold mb-4">Редагування пріоритетності</h2>

            <form className="mb-4 flex flex-col gap-4" action={action}>

                <div className="flex gap-2 items-center justify-center">
                    <h1 className="text-lg font-semibold min-w-24" >
                        {props.location?.name}
                    </h1>
                    <div className="flex flex-col gap-1">
                        {props.items
                            .filter((item) => item.feedtypes?.id === props.item?.feed.id)
                            ?.map((item, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`feed_${item.id}_${index}`}
                                        name={`feed`}
                                        value={item.id}
                                        className="mr-2"
                                        defaultChecked={item.id == priority ? true : false}
                                    />
                                    <label htmlFor={`feed_${item.id}_${index}`} className="text-sm">{item.name}</label>
                                </div>
                            ))}
                    </div>
                    <input type="hidden" name={`location`} value={props.location?.id} />
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                    >
                        Зберегти
                    </button>
                    {/* <button className="hover:bg-blue-500 hover:text-white border font-bold py-2 px-4 rounded" 
                        onClick={handleCloseModal}>
                        Скасувати
                    </button> */}
                </div>

            </form>

        </div>
    )
}