import React from 'react';

interface SummaryBatchesProps {
    dataDictionary: Record<string, Pool>;
    date: string;
}

interface Batch {
    batchName: string;
    quantity: number;
    fishWeight: string[];
}

interface Pool {
    [key: string]: Batch[];
}

export default function SummaryBatches({ dataDictionary, date }: SummaryBatchesProps) {
    const pools = dataDictionary[date] || {}; // Отримуємо басейни для визначеного дня

    const dailySummary: Record<string, number> = {};

    // Обчислюємо загальну кількість партій для визначеного дня
    Object.values(pools).forEach(batches => {
        batches.forEach(batch => {
            const { batchName, quantity } = batch;
            dailySummary[batchName] = (dailySummary[batchName] || 0) + quantity;
        });
    });

    return (
    <table className="min-w-full divide-y divide-gray-200 mb-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-4 py-2 border text-center bg-green-200 text-sm" colSpan={2}>
                    Підсумок
                </th>
            </tr>
            {/* <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Партія</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Кількість</th>
            </tr> */}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(dailySummary).map(([batchName, totalQuantity]) => (
                <tr key={`${date}_${batchName}`}>
                    <td className="px-6 py-4 whitespace-nowrap">{batchName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{totalQuantity}</td>
                </tr>
            ))}
            <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold">Загальна кількість: </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">{Object.values(dailySummary).reduce((acc, curr) => acc + curr, 0)}</td>
            </tr>
        </tbody>
    </table>
    );
}
