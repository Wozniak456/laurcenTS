'use client'

import { Input, Select, SelectItem, useDisclosure } from "@nextui-org/react";
import FormButton from "../common/form-button";
import * as actions from '@/actions';
import { useFormState } from "react-dom";
import { poolManagingTypeExtended } from "@/types/app_types";
import { itembatches } from "@prisma/client";

interface ActualizationPageProps{
    poolInfo: poolManagingTypeExtended,
    batches: {
        id: bigint;
        name: string;
        items: {
            id: number;
            name: string;
        };
    }[],
    feeds: {
        id: number;
        name: string;
        feed_type_id: number | null;
        default_unit_id: number | null;
    }[]
}

export default function ActualizationPage({poolInfo, batches, feeds} : ActualizationPageProps){

    const [formState, action] = useFormState(actions.initialStocking, { message: '' });

    return(
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-8">Басейн {poolInfo.location?.name}</h1>
                <form className="space-y-6" action={action}>
                    {/* Приховані поля */}
                    <input type="hidden" name="location_id_from" value={87} />
                    <input type="hidden" name="location_id_to" value={poolInfo.location?.id} />

                    {/* Основні поля форми */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            {poolInfo.batch ? 
                            <Input 
                                label="Партія" 
                                name="batch_id"
                                readOnly
                                // isRequired
                                className="w-full"
                                value={poolInfo.batch.name}
                            />
                            :
                            <Select 
                                label="Партія" 
                                name="batch_id"
                                isRequired
                                className="w-full"
                            >
                                {batches.map(batch => (
                                    <SelectItem key={Number(batch.id)} value={Number(batch.id)}>
                                        {batch.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            }
                            
                        </div>
                        <div>
                            {poolInfo.batch && poolInfo.qty ? 
                            <Input 
                                label="Кількість:" 
                                name="fish_amount"
                                readOnly
                                className="w-full"
                                value={String(poolInfo.qty)}
                            />
                            :
                            <Input 
                                label="Кількість:" 
                                name="fish_amount"
                                type='number'
                                min={1}
                                isRequired
                                className="w-full"
                            />
                            }
                        </div>
                        <div>{poolInfo.batch && poolInfo.fishWeight ? 
                            <Input 
                                label="Сер. вага, г" 
                                name="average_fish_mass"
                                readOnly
                                className="w-full"
                                value={String(poolInfo.fishWeight)}
                            />
                            :
                            <Input 
                                label="Сер. вага, г" 
                                name="average_fish_mass"
                                type='number'
                                min={0.0001}
                                step="any"
                                isRequired
                                className="w-full"
                            />
                        }
                            
                        </div>
                    </div>

                    {/* Динамічні поля кормів */}
                    <div className="grid grid-cols-1 gap-6">
                        <h1 className="text-red-500">*Дані вказуються у грамах</h1>
                        {feeds.map((feed, feedIndex) => (
                            <Input
                                key={feedIndex}
                                label={feed.name} 
                                name={`feed_${feed.id}`}
                                type='number'
                                min={1}
                                className="w-full"
                            />
                        ))}
                    </div>

                    {/* Кнопка відправки */}
                    <div className="flex justify-end">
                        <FormButton 
                            color="primary"
                            // className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition duration-300"
                        >
                            Зберегти
                        </FormButton>
                    </div>
                </form>
            </div>
        </div>

    )
}