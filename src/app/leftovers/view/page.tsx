'use client'
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import Header from '@/components/header'
import { Button } from "@nextui-org/react";
// interface DataItem{
//   batch_id: string;
//   batch_name: string;
//   feed_type_name: string,
//   item_name: string,
//   start_saldo: number;
//   incoming: number;
//   outcoming: number;
//   end_saldo: number;
// }

// interface FilterableTableProps {
//    data: DataItem[],
//    start: Date | undefined,
//    end: Date | undefined
// }


export default function FilterableTable() {
    const [StartSaldoDate, setStartSaldoDate] = useState<string | undefined>(undefined);
    const [EndSaldoDate, setEndSaldoDate] = useState<string | undefined>(undefined);

    const handleStartInputDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const date = new Date(event.target.value)
        setStartSaldoDate(date.toISOString().split("T")[0]);
    };

    const handleEndInputDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const date = new Date(event.target.value)
        setEndSaldoDate(date.toISOString().split("T")[0]);
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="fixed top-0 left-0 w-full">
                <Header />
            </div>
            <div className="bg-white p-8 rounded shadow-lg w-2/5">
                <h1 className="text-3xl font-bold mb-8">Розрахунок залишків кормів на складі</h1>
                <div className="flex flex-col gap-4 justify-between mb-8">
                    <div className="flex gap-4 flex-wrap items-center">
                        <label className="w-40" htmlFor="created">
                            Дата початку:
                        </label>
                        <input 
                            name="created"
                            className="border rounded p-2 flex-grow min-w-32"
                            type="date"
                            id="created"
                            onChange={handleStartInputDateChange}
                            required
                        />
                    </div>
                    <div className="flex gap-4 flex-wrap items-center">
                        <label className="w-40" htmlFor="created">
                            Дата кінця:
                        </label>
                        <input 
                            name="created"
                            className="border rounded p-2 flex-grow min-w-32"
                            type="date"
                            id="created"
                            onChange={handleEndInputDateChange}
                            required
                        />
                    </div>
                </div>
                {StartSaldoDate && EndSaldoDate &&
                <div className="flex justify-end w-full">
                    <Button color="primary">
                        <Link 
                            href={`/leftovers/${StartSaldoDate}_${EndSaldoDate}`}
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
