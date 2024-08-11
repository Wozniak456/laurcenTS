'use client'

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import newFileButton from '../../../public/icons/create.svg'
import PurchLineItem from '@/components/PurchLines/purch-line-element'
import CreateEditLineForm from '../PurchLines/create-edit-form'
import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/table";
import line from "next-auth/providers/line";
import PurchLineDeleteForm from "./delete-message";

interface PurchLinesComponentProps {
    // lines: {
    //     id: number;
    //     items: {
    //         id: number;
    //         name: string;
    //         feed_type_id: number | null;
    //     };
    //     quantity: number;
    //     units: {
    //         id: number;
    //         name: string;
    //     };
    //     item_id: number;
    // }[] | undefined,

    purchHeader: {
        id: bigint;
        doc_id: bigint | null;
        date_time: Date;
        vendor_id: number;
        vendor_doc_number: string;
        vendors: {
            id: number;
            name: string;
            description: string | null;
        };
        purchaselines: {
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
        }[];
    } | undefined,
    items: {
        id: number;
        name: string;
        units: {
            id: number;
            name: string;
        } | null;
        vendor_id: number | null;
    }[]
}

interface line {
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
}

export default function PurchLinesList( {purchHeader, items} : PurchLinesComponentProps){
    // const [showModal, setShowModal] = useState<boolean>(false);

    const [selectedLine, setSelectedLine] = useState<number | undefined>(undefined);
    // const [linesList, setLinesList] = useState<line[] | undefined>(lines);

    // const handleCreateNewPurchLine = () => {
    //     setShowModal(true);
    // };

    // useEffect(() => {
    //     setLinesList(lines);
    //     console.log('lines changed, ', lines)
    // }, [lines]);

    return(
        <div className="mt-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Рядки прибуткової накладної: {purchHeader?.vendors.name} ({purchHeader?.vendor_doc_number})</h1>
                <div>
                    {!purchHeader?.doc_id ? 
                    <Popover placement="bottom" backdrop="blur">
                        <PopoverTrigger>
                            <Button color="primary" >
                                Новий рядок
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <CreateEditLineForm 
                                purchHeader={purchHeader} 
                                items={items} 
                                // setShowModal={setShowModal} 
                            />
                        </PopoverContent>
                    </Popover>
                : null}
                    
                </div>
            </div>

            <Table >
                <TableHeader>
                    <TableColumn className="text-center">Index</TableColumn>
                    <TableColumn className="text-center">Item ID</TableColumn>
                    <TableColumn className="text-center">Item Name</TableColumn>
                    <TableColumn className="text-center">Feed Type ID</TableColumn>
                    <TableColumn className="text-center">Unit Name</TableColumn>
                    <TableColumn className="text-center">Quantity</TableColumn>
                    <TableColumn className="text-center">Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {purchHeader?.purchaselines && purchHeader.purchaselines.length > 0 ? (
                    purchHeader.purchaselines
                    .sort((a, b) => a.id - b.id)
                    .map((line, index) => (
                        // <PurchLineItem 
                        //   key={line.id}
                        //   purch_header={purchHeader} 
                        //   line={line} 
                        //   index={index} 
                        //   items={items} 
                        //   setSelectedLine={setSelectedLine}
                        //   selectedLine={selectedLine}
                        // />
                        <TableRow key={index}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="text-center">{line?.item_id}</TableCell>
                            <TableCell className="text-center">{line?.items.name}</TableCell>
                            <TableCell className="text-center">{line?.items.feed_type_id}</TableCell>
                            <TableCell className="text-center">{line?.units.name}</TableCell>
                            <TableCell className="text-center">{line?.quantity}</TableCell>
                            <TableCell className="w-40 whitespace-nowrap text-center">
                                {!purchHeader?.doc_id && 
                                <>
                                <Popover placement="bottom">
                                    <PopoverTrigger>
                                        <Button color="primary" className="mr-2">
                                        Edit
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <CreateEditLineForm 
                                            purchHeader={purchHeader} 
                                            line={line} 
                                            index={index} 
                                            items={items} 
                                            // setShowModal={setShowEditModal} 
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Popover placement="bottom">
                                    <PopoverTrigger>
                                        <Button color="danger">
                                        Delete
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PurchLineDeleteForm 
                                        line={line} 
                                        // setShowModal={setShowDeleteModal} 
                                        />
                                    </PopoverContent>
                                </Popover></>}
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell className="text-center">No data</TableCell>
                        <TableCell className="text-center">No data</TableCell>
                        <TableCell className="text-center">No data</TableCell>
                        <TableCell className="text-center">No data</TableCell>
                        <TableCell className="text-center">No data</TableCell>
                        <TableCell className="text-center">No data</TableCell>
                        <TableCell className="text-center">No data</TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* <table className="w-full text-sm">
                <thead className="bg-blue-200">
                    <tr>
                        <th className="px-4 py-2 text-center border border-gray-400"># Line</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Item ID</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Item name</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Feed type</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Unit ID</th>            
                        <th className="px-4 py-2 text-center border border-gray-400">Qty</th>  
                        <th colSpan={3} className="px-4 py-2 text-center border border-gray-400">Edit</th> 
                    </tr>
                </thead>
                <tbody>
                {lines
                ?.sort((a, b) => Number(a.id) - Number(b.id))
                .map((line, index)=> {
                    return(
                        <PurchLineItem 
                        key={line.id}
                        purch_header={purchHeader} 
                        line={line} 
                        index={index} 
                        items={items} 
                        setSelectedLine={setSelectedLine}
                        selectedLine={selectedLine}
                        />            
                    )}
                )}
                </tbody> 
            </table> */}

            {/* {showModal && (
                <CreateEditLineForm 
                purchHeader={purchHeader} 
                items={items} 
                setShowModal={setShowModal} 
                />
            )} */}
            
        </div>
        
      )
}