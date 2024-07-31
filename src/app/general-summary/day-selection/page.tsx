'use client'
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import Header from '@/components/header'
import { Button, Input } from "@nextui-org/react";
import {RadioGroup, Radio} from "@nextui-org/react";

export default function SelectDay() {
    const [reportDate, setReportDate] = useState<string | undefined>(undefined);

    const today = new Date()

    const handleTodayDateChange = () => {
        setReportDate(today.toISOString().split("T")[0]);
    };

    const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const date = event.target.value;
        setReportDate(date);
    };    

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="fixed top-0 left-0 w-full">
                <Header />
            </div>
            <div className="bg-white p-8 rounded shadow-lg w-2/5">
                <h1 className="text-3xl font-bold mb-8 text-center ">Оберіть день для отримання звіту</h1>
        
                <div className="flex gap-4 flex-wrap items-center justify-between mb-8">
                   
                    <RadioGroup
                        >
                        <Radio 
                            value={reportDate ? reportDate : ''}
                            onChange={handleTodayDateChange}
                            checked={reportDate == today.toISOString().split("T")[0]}
                            >
                                Сьогодні
                        </Radio>
                    </RadioGroup>

                    <Input 
                        label="Дата:" 
                        name="created"
                        placeholder='Дата:'
                        type='date'
                        className="w-2/5"
                        // isInvalid={!!formState.errors?.created}
                        // errorMessage={formState.errors?.created}
                        value={reportDate}
                        onChange={handleDateChange}
                        isRequired
                    />
                </div>
                   
                {reportDate &&
                <div className="flex justify-end w-full ">
                    <Button color="primary">
                        <Link 
                            href={`/general-summary/${reportDate}`}
                            // className="py-2 hover:bg-gray-200 w-40 text-center bg-blue-200"
                            >
                            Розрахувати
                        </Link>
                    </Button>
                    
                </div>}
            </div>
        </div>
    );
}
