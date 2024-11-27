'use client'

import React, { useEffect, useState } from "react";
import PurchLinesList from '@/components/PurchLines/purchlines-table'
import CreateEditPurchHeaderForm from '../PurchHeaders/create-edit-header-form'
import PurchHeaderDeleteForm from '../PurchHeaders/delete-message'
import RegisteringGoods from '../PurchHeaders/registering-form'
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/table";

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link} from "@nextui-org/react";

type Item = {
    id: number;
    name: string;
    description: string | null;
    item_type_id: number | null;
    feed_type_id: number | null;
    default_unit_id: number | null;
    parent_item: number | null;
    vendor_id: number | null;
}

interface PurchTableComponentProps {
    purchtables: {
        id: bigint;
        doc_id: bigint | null;
        date_time: Date;
        vendor_id: number;
        vendor_doc_number: string;
        vendors: {
            id: number;
            name: string;
            description: string | null;
            items: Item[]
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
    }[];
    vendors: {
        id: number;
        name: string;
        description: string | null;
    }[],
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

export default function PurchTableComponent({ purchtables, vendors, items }: PurchTableComponentProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    // const [formState, action] = useFormState(CRUDactions.createPurchTable, { message: '' });
    const [selectedRow, setSelectedRow] = useState<bigint | undefined>(undefined);
    
    const [showCreatePurchHeaderModal, setShowCreatePurchHeaderModal] = useState<boolean>(false);
    

    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

    const handleRowClick = (purchID: bigint) => {
        setSelectedRow(purchID);
    };
    
    function handleCreateNewPurchTable(){
        setShowCreatePurchHeaderModal(true)
    }

    function handleEditPurchHeader(){
        setShowEditModal(true)
    }

    function handleDeletePurchHeader(){
        setShowDeleteModal(true)
    }

    function handleRegisterGoodsInProduction() {
        setShowRegisterModal(true)
    }

    const [showForm, setShowForm] = useState(false);
    const [currentHeader, setCurrentHeader] = useState<BigInt|null>(null);


    const [linesList, setLinesList] = useState<line[] | undefined>(purchtables.find(table => table.id === selectedRow)?.purchaselines);

    const handleRowSelection = (headerID: bigint) => {
        setCurrentHeader(headerID);
        handleRowClick(headerID);
        setShowForm(true);
    };

    // useEffect(() => {
    //     console.log('selectedRow changed, ', selectedRow)
    // }, [selectedRow]);

    return(
        <div className="flex flex-col gap-4 my-4">
            <div className="flex justify-between items-center mb-2 w-full">
                <h1 className="text-xl font-bold">Прибуткові накладні</h1>
                
                <Button onPress={onOpen} color="primary">Нова накладна</Button>
                <Modal 
                    isOpen={isOpen} 
                    onOpenChange={onOpenChange}
                    placement="top-center"
                >
                    <ModalContent>
                    {(onClose) => (
                        <>
                        <ModalHeader className="flex flex-col gap-1"></ModalHeader>
                        <ModalBody>
                            <CreateEditPurchHeaderForm vendors={vendors} setShowForm={setShowCreatePurchHeaderModal}/>
                        </ModalBody>
                        <ModalFooter>
                            
                        </ModalFooter>
                        </>
                    )}
                    </ModalContent>
                </Modal>
            </div>
        <Table isStriped aria-label="Example static collection table">
            <TableHeader>
                <TableColumn className="text-center">Doc ID</TableColumn>
                <TableColumn className="text-center">Delivery Date</TableColumn>
                <TableColumn className="text-center">Vendor Doc ID</TableColumn>
                <TableColumn className="text-center">Vendor ID</TableColumn>
                <TableColumn className="text-center">Vendor Name</TableColumn>
                <TableColumn className="text-center">Status</TableColumn>
                <TableColumn className="text-center">Actions</TableColumn>
            </TableHeader>
            <TableBody>
                {purchtables
                .sort((a, b) => Number(b.id) - Number(a.id))
                .map(header => (
                    <TableRow key={header.id} onClick={() => handleRowSelection(header.id)}>
                        <TableCell className="text-center">{header.doc_id !== null ? Number(header.doc_id) : ''}</TableCell>
                        <TableCell className="text-center">{header.date_time.toISOString().split("T")[0]}</TableCell>
                        <TableCell className="text-center">{header.vendor_doc_number}</TableCell>
                        <TableCell className="text-center">{header.vendor_id}</TableCell>
                        <TableCell className="text-center">{header.vendors.name}</TableCell>
                        <TableCell className="text-center">
                            {header.purchaselines.length === 0 ? 
                                'None' : 
                                header.doc_id === null ? 
                                    'Saved' : 
                                    'Posted'
                            }
                        </TableCell>
                        <TableCell className="w-80">
                            {header.doc_id === null && (
                                <div className="w-full">
                                    <Popover placement="left-start" >
                                        <PopoverTrigger>
                                            <Button className="mr-2" color="primary" onClick={handleEditPurchHeader}>
                                                Edit
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <CreateEditPurchHeaderForm 
                                                header={header}
                                                vendors={vendors}
                                                setShowForm={setShowEditModal}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Popover placement="left-start">
                                        <PopoverTrigger>
                                            <Button className="mr-2" color="danger" onClick={handleDeletePurchHeader}>
                                                Delete
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PurchHeaderDeleteForm
                                                header={header}
                                                setShowModal={setShowDeleteModal} 
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {header.purchaselines.length > 0 && (
                                        <RegisteringGoods
                                        header={header}
                                        setShowForm={setShowRegisterModal} 
                                    />
                                    )}
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                    ))}
            </TableBody>
        </Table>

        {showForm && currentHeader && (
            <PurchLinesList 
                // lines={linesList}
                // {purchtables.find(table => table.id === selectedRow)?.purchaselines}
                purchHeader={purchtables.find(table => table.id === selectedRow)} 
                items={items}
            />
            )}
            
        </div>
    )
}