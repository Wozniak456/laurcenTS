'use client'
import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import ExportButton from "@/components/fetchingTableToPrint";

// Тип FetchingInfo
type FetchingInfo = {
    locationName: string,
    locationId: number,
    commercialFishingAmount: number,
    commercialFishingWeight: number,
    sortedAmount: number,
    sortedWeight: number,
    growOutAmount: number,
    growOutWeight: number,
    moreThan500Amount: number,
    moreThan500Weight: number,
    lessThan500Amount: number,
    lessThan500Weight: number,
    weekNum: number
}

interface FetchingInfoTableProps {
    summary: FetchingInfo[],
    weekNum: number
}

export default function FetchingInfoTable({summary, weekNum} : FetchingInfoTableProps) {
    return (
        <>
        <h1 className="my-4 font-bold">Тиждень: {weekNum}</h1>
        <div className="my-4">
            <ExportButton summary={summary} />
        </div>
        
        <Table
        aria-label="Fetching Information Summary"
        color="primary"  
        selectionMode="none" 
        >
        <TableHeader>
            <TableColumn>Басейн</TableColumn>

            <TableColumn className="bg-blue-100">Товарна</TableColumn>
            <TableColumn className="bg-blue-100">кг</TableColumn>
            <TableColumn className="bg-blue-100">сер. вага</TableColumn>

            <TableColumn>Відсортована</TableColumn>
            <TableColumn>кг</TableColumn>
            <TableColumn>сер. вага</TableColumn>

            <TableColumn className="bg-blue-100">Доріст</TableColumn>
            <TableColumn className="bg-blue-100">кг</TableColumn>
            <TableColumn className="bg-blue-100">сер. вага</TableColumn>

            <TableColumn>500+</TableColumn>
            <TableColumn>кг</TableColumn>
            <TableColumn>сер. вага</TableColumn>

            <TableColumn className="bg-blue-100">-500</TableColumn>
            <TableColumn className="bg-blue-100">кг</TableColumn>
            <TableColumn className="bg-blue-100">сер. вага</TableColumn>

        </TableHeader>
        <TableBody>
            {Object.entries(summary).map(([locationName, info]) => (
            <TableRow key={locationName} className="text-center">
                <TableCell>{info.locationName}</TableCell>

                <TableCell className="bg-blue-100" >{info.commercialFishingAmount}</TableCell>
                <TableCell className="bg-blue-100">{info.commercialFishingWeight}</TableCell>
                <TableCell className="bg-blue-100">{(info.commercialFishingWeight / info.commercialFishingAmount).toFixed(1)}</TableCell>

                <TableCell>{info.sortedAmount}</TableCell>
                <TableCell>{info.sortedWeight}</TableCell>
                <TableCell>{info.sortedWeight / info.sortedAmount}</TableCell>

                <TableCell className="bg-blue-100">{info.growOutAmount}</TableCell>
                <TableCell className="bg-blue-100">{info.growOutWeight}</TableCell>
                <TableCell className="bg-blue-100">{(info.growOutWeight / info.growOutAmount).toFixed(1)}</TableCell>

                <TableCell>{info.moreThan500Amount}</TableCell>
                <TableCell>{info.moreThan500Weight}</TableCell>
                <TableCell>{info.moreThan500Weight / info.moreThan500Amount}</TableCell>

                <TableCell className="bg-blue-100">{info.lessThan500Amount}</TableCell>
                <TableCell className="bg-blue-100">{info.lessThan500Weight}</TableCell>
                <TableCell className="bg-blue-100">{(info.lessThan500Weight / info.lessThan500Amount).toFixed(1)}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        </>
    );
}
