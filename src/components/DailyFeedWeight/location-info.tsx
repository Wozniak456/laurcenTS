'use client'
import React, { useState } from 'react';
import { calculationAndFeedExtended } from '@/types/app_types'
import PriorityForm from '@/components/DailyFeedWeight/priority-form'
import { Input, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";


export type LocationComponentProps = {
    row: Row,
    items: {
        id: number;
        name: string;
        feedtypes: {
            id: number;
            name: string;
        } | null;
    }[]
}
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

type Row = {
    location?: {
        id: number,
        name: string
    },
    rows?: subRow[],

} | undefined;

export default function LocationComponent({ row, items }: LocationComponentProps) {
    // console.log(row?.location?.name)
    // row?.rows?.map(row => 
    //     console.log(row.item)
    // )

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

    const handleOpen = (index: number) => {
        setOpenItemIndex(index);
    };

    const handleClose = () => {
        setOpenItemIndex(null);
    };

    return (
        <React.Fragment key={row?.location?.id}>
            <tr>
                <td
                    className="px-4 h-10 border border-gray-400"
                    rowSpan={Number(row?.rows?.length) + 1}>
                    {row?.location?.name}
                </td>
            </tr>
            {row?.rows?.map((item, itemIndex) => {
                return (
                    <tr key={itemIndex}>
                        <td className="px-4 h-10 border border-gray-400">{item.qty}</td>
                        <td className="px-4 h-10 border border-gray-400">{item.feed.name}</td>
                        <td className="px-4 h-10 border border-gray-400">

                            <button onClick={() => handleOpen(itemIndex)} color="default">
                                {item.item.name}
                            </button>
                            {openItemIndex === itemIndex && (
                                <Modal isOpen={true} onClose={handleClose} placement="top-center">
                                    <ModalContent>
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Вибір корму</ModalHeader>
                                                <ModalBody>
                                                    <PriorityForm location={row.location} items={items} item={item} />
                                                </ModalBody>
                                                <ModalFooter>
                                                    {/* Можливо, ви хочете додати додаткові дії */}
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            )}
                        </td>
                    </tr>
                )
            })}

        </React.Fragment>
    )
}

