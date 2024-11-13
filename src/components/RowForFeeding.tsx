import React, { ChangeEvent, useEffect, useState } from "react";
import Image from 'next/image';
import feedButton from '../../public/icons/typcn_arrow-up-outline.svg'
import SuccessButton from '../../public/icons/SuccessFeeding.svg'
import CrossButton from '../../public/icons/UnsuccessfulFeeding.svg'
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import FormButton from "./common/form-button";

interface Feeding {
    feedType: string;
    feedName?: string;
    feedId?: number,
    feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

interface RowForFeedingProps {
    locInfo: {
        id: number,
        name: string
    },
    rowData: Feeding,
    times: {
        id: number;
        time: string;
    }[],
    rowCount?: number,
    today: string,
    batch?: {
        id: number,
        name: string
    }
}

type itemAndTime = {
    item: string | undefined;
    time?: string;
} | null

export default function RowForFeeding({ locInfo, rowData, times, rowCount, today, batch }: RowForFeedingProps) {
    // useEffect(() => {
    //     console.log('loc: ', locInfo.id, 'Row Data:', rowData);
    // }, [rowData]);

    const fed = rowData.feedings
        ? Object.values(rowData.feedings).some(
            (feeding) => feeding.editing && feeding.editing.trim() !== ""
        )
        : false;


    const [formState, action] = useFormState(actions.feedBatch, { message: '' });

    const [editingValue, setEditingValue] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (rowData.feedings) {
            const initialValues: { [key: string]: string } = {};

            times.forEach(({ time }) => {
                const feedingTime = parseInt(time.split(':')[0]); // Година (без хвилин)
                const feeding = rowData.feedings ? rowData.feedings[feedingTime]?.feeding : ''; // Значення для конкретної години

                if (feeding) {
                    const key = `${locInfo.id}-${feedingTime}`;
                    initialValues[key] = feeding; // Записуємо початкове значення в state
                }
            });

            // Оновлюємо state з початковими значеннями
            setEditingValue(initialValues);
        }
    }, [rowData, times, locInfo.id]);


    function handleInputChange(time: string, poolId: number, target: string) {
        const key = `${poolId}-${time}`; // Створюємо унікальний ключ для поєднання часу і poolId
        setEditingValue((prevState) => ({
            ...prevState,
            [key]: target, // Оновлюємо значення для цього поєднання
        }));
    }

    const [buttonMode, setButtonMode] = useState(false);

    return (
        <tr>
            {rowCount && rowCount > 0 ? (
                <td rowSpan={rowCount} className="px-4 py-2 border border-gray-400 w-14">
                    {locInfo.name}
                </td>
            ) : null}

            <td className="px-4 py-2 border border-gray-400 w-14">{rowData.feedType}</td>
            <td className="px-4 py-2 border border-gray-400 w-14">{rowData.feedName}</td>

            {/* Рендеримо для кожного часу */}
            {times.map((time, index) => {
                const feedingTime = parseInt(time.time.split(':')[0]); // Отримуємо тільки годину (наприклад, "10" з "10:00")
                const key = `${locInfo.id}-${feedingTime}`; // Створюємо унікальний ключ для цього часу

                return (
                    <React.Fragment key={index}>
                        <td className="px-4 py-2 border border-gray-400 w-14">
                            {rowData.feedings ? rowData.feedings[feedingTime]?.feeding : null}
                        </td>

                        {fed && rowData.feedings ? (
                            <td className="px-4 py-2 border border-gray-400 w-14">
                                {rowData.feedings[feedingTime]?.editing?.trim()
                                    ? rowData.feedings[feedingTime].editing : "0"}
                            </td>
                        ) : (
                            <td className="px-4 py-2 border border-gray-400 w-14">
                                <input
                                    name={`feed_given_${index}`}
                                    className="border border-black w-full bg-blue-100 text-center"
                                    id={`feed_given_${index}`}
                                    value={
                                        editingValue[key] !== undefined
                                            ? editingValue[key]
                                            : rowData.feedings?.[feedingTime]?.feeding || ''
                                    }
                                    onChange={(e) =>
                                        handleInputChange(String(feedingTime), locInfo.id, e.target.value)
                                    }
                                />
                            </td>
                        )}
                    </React.Fragment>
                );
            })}

            <td className="px-4 py-2 border border-gray-400 w-14">
                <form action={action} >
                    <input type="hidden" name="location_id" value={locInfo.id} />
                    <input type="hidden" name="executed_by" value={3} />
                    <input type="hidden" name="item_id" value={rowData.feedId} />
                    <input type="hidden" name="batch_id" value={batch?.id} />
                    <input type="hidden" name="date_time" value={today} />

                    {Object.entries(editingValue).map(([key, value]) => {
                        const [poolId, time] = key.split('-');
                        if (!poolId || !time || !value) return null;
                        return (
                            <input
                                key={key}
                                type="hidden"
                                name={`time_${time}`} // Формуємо ім'я інпуту
                                value={value} // Відправляємо нове значення
                            />
                        );
                    })}
                    {!fed &&
                        <button
                            type="submit"
                            className=""
                            onClick={() => { setButtonMode(true); }}
                        >
                            {!buttonMode && <Image src={feedButton} alt="feeding icon" height={35} />}
                            {formState?.message &&
                                <Image
                                    src={formState.message && CrossButton}
                                    alt="status icon"
                                    height={30} />
                            }
                            {!formState &&
                                <Image
                                    src={SuccessButton}
                                    alt="status icon"
                                    height={30} />
                            }
                        </button>
                    }

                </form>
            </td>
        </tr>
    );
}