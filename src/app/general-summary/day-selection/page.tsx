'use client'
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import Header from '@/components/header'

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
                <div className="flex flex-col items-center gap-8">
                    <div className="flex gap-4 flex-wrap items-center justify-center">
                        <label htmlFor="today_date">
                            Сьогодні
                        </label>
                        <input 
                            type="radio"
                            name="date_option"
                            id="today_date"
                            onChange={handleTodayDateChange}
                            required
                            className="w-6 h-6"
                            checked={reportDate == today.toISOString().split("T")[0]}
                        />
                    </div>
                    <div className="flex flex-col gap-4 justify-center items-center mb-8">
                        <div className="flex gap-4 flex-wrap items-center justify-center">
                            <label className="w-40" htmlFor="created">
                                Дата:
                            </label>
                            <input 
                                name="created"
                                className="border rounded p-2"
                                type="date"
                                id="created"
                                value={reportDate}
                                onChange={handleDateChange}
                                required
                            />
                        </div>
                    </div>
                </div>
                
                {reportDate &&
                <div className="flex justify-end w-full">
                    <Link 
                        href={`/general-summary/${reportDate}`}
                        className="py-2 hover:bg-gray-200 w-40 text-center bg-blue-200">
                        Розрахувати
                    </Link>
                </div>}
            </div>
        </div>
    );
}
