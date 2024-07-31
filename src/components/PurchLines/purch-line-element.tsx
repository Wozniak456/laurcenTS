'use client'

import React, { useState } from "react";
import Image from 'next/image';
import deleteButton from '../../../public/icons/delete.svg'
import editButton from '../../../public/icons/edit.svg'
import CreateEditLineForm from '../PurchLines/create-edit-form'
import PurchLineDeleteForm from '../PurchLines/delete-message'
import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/table";

interface PurchLinesComponentProps {
    purch_header: {
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
    line: {
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
    },
    index: number,
    items: {
        id: number;
        name: string;
        units: {
            id: number;
            name: string;
        } | null;
        vendor_id: number | null;
    }[],
    
    setSelectedLine: React.Dispatch<React.SetStateAction<number | undefined>>,
    selectedLine: number | undefined
    // selectedItem: number | undefined
}

// ЦЕ КОЖНА ЛІНІЯ
export default function PurchLineItem( {purch_header, line, index, items, setSelectedLine, selectedLine} : PurchLinesComponentProps){

    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
   
    function handleEditPurchLine(){
        // setShowEditModal(true)
        setSelectedLine(line.id)
    }

    function handleDeletePurchLine(){
        // setShowDeleteModal(true)
        setSelectedLine(line.id)
        //setSelectedLine(line.id)
    }

    return (
      <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{line?.item_id}</TableCell>
      <TableCell>{line?.items.name}</TableCell>
      <TableCell>{line?.items.feed_type_id}</TableCell>
      <TableCell>{line?.units.name}</TableCell>
      <TableCell>{line?.quantity}</TableCell>
      <TableCell className="w-auto whitespace-nowrap">
        <Popover placement="bottom">
          <PopoverTrigger>
            <Button color="primary" onClick={handleEditPurchLine}>
              Edit
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <CreateEditLineForm 
              purchHeader={purch_header} 
              line={line} 
              index={index} 
              items={items} 
              // setShowModal={setShowEditModal} 
            />
          </PopoverContent>
        </Popover>
        <Popover placement="bottom">
          <PopoverTrigger>
            <Button color="danger" onClick={handleDeletePurchLine}>
              Delete
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PurchLineDeleteForm 
              line={line} 
              // setShowModal={setShowDeleteModal} 
            />
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
    // <TableRow>
    //     <TableCell>No data</TableCell>
    //     <TableCell>No data</TableCell>
    //     <TableCell>No data</TableCell>
    //     <TableCell>No data</TableCell>
    //     <TableCell>No data</TableCell>
    //     <TableCell>No data</TableCell>
    //     <TableCell>No data</TableCell>
    // </TableRow>
      );
}