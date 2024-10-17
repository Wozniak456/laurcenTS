'use client'
import React, { useState } from "react";
import FormButton from "./common/form-button";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import EditAccumulation from "./accu-editing-modal";
import ExportButton from "./accumulationTableToPrint";

interface StockingTableProps {
  pools: PoolType[],
  vendors: Vendor[],
  batches: Batch[]
}

type Batch = {
  id: bigint;
  name: string;
  description: string | null;
  item_id: number;
  created: Date | null;
  created_by: number;
  expiration_date: Date | null;
  packing: number | null;
  price: number | null;
}

interface Vendor {
  name: string;
  items: {
    id: number;
    feedtypes: {
      name: string;
      feedconnections: {
        from_fish_weight: number;
        to_fish_weight: number;
      } | null;
    } | null;
  }[];
}

export type Item = {
  item_id: number,
  qty: number
}

export type vendorType = {
  vendor_id: number
  items: Item[]
}

export type PoolType = {
  location_id: number;
  location_name: string;
  vendors: vendorType[]
};

// Змініть RowData, щоб зберігати числові значення
type RowData = {
  key: string;
  location_id: string;
  location_name: string;
  total: number;
  [key: string]: string | number;
};

const StockingTable: React.FC<StockingTableProps> = ({ pools, vendors, batches }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  const columns = [
    { key: "location_name", label: "-" },
    ...vendors.flatMap(vendor =>
      vendor.items.map(item => ({
        key: `${item.id}`,
        label: `${vendor.name.toUpperCase()} - ${item.feedtypes?.name}`,
      }))
    ),
    { key: "total", label: "Total" }
  ];

  // Генерація рядків для qty та price без форматування
  const rows = pools.flatMap(pool => {
    const totalQty = pool.vendors.reduce(
      (acc, vendor) =>
        acc + vendor.items.reduce((vendorAcc, item) => vendorAcc + item.qty, 0),
      0
    );

    const totalPrice = pool.vendors.reduce(
      (acc, vendor) =>
        acc + vendor.items.reduce((vendorAcc, item) => {
          const batch = batches.find(b => b.item_id === item.item_id);
          return vendorAcc + (batch && batch.price ? batch.price * item.qty : 0);
        }, 0),
      0
    );

    const qtyRowData: RowData = {
      key: `${pool.location_id}-qty`,
      location_id: pool.location_id.toString(),
      location_name: pool.location_name,
      total: totalQty > 0 ? totalQty / 1000 : 0,
    };

    const priceRowData: RowData = {
      key: `${pool.location_id}-price`,
      location_id: pool.location_id.toString(),
      location_name: `${pool.location_name} (Price)`,
      total: totalPrice > 0 ? totalPrice / 1000 : 0,
    };

    vendors.forEach(vendor => {
      vendor.items.forEach(feed => {
        const qtyCellValue = pool.vendors.reduce((acc, vendorItem) => {
          const item = vendorItem.items.find(item => item.item_id === feed.id);
          return item ? acc + item.qty : acc;
        }, 0);

        const batch = batches.find(b => b.item_id === feed.id);
        const priceCellValue = pool.vendors.reduce((acc, vendorItem) => {
          const item = vendorItem.items.find(item => item.item_id === feed.id);
          return item && batch && batch.price ? acc + batch.price * item.qty : acc;
        }, 0);

        qtyRowData[`${feed.id}`] = qtyCellValue > 0 ? qtyCellValue / 1000 : '';
        priceRowData[`${feed.id}`] = priceCellValue > 0 ? priceCellValue / 1000 : '';
      });
    });

    return [qtyRowData, priceRowData];
  });

  const handleRowClick = (row: RowData) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  return (
    <>
      <ExportButton columns={columns} rows={rows} />

      <form>
        <Table 
          className="min-w-full table-auto w-full my-8" 
          selectionMode="single" color="primary"
          aria-label="table">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>

          <TableBody items={rows}>
            {(item) => (
              <TableRow key={item.key} onClick={() => handleRowClick(item)}>
                {(columnKey) => {
                  const value = item[columnKey];
                  const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
                  return (
                    <TableCell className="border">
                      {displayValue}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </form>

      <Modal 
        backdrop="blur" // Додаємо розмиття для більш світлого фону
        isOpen={isModalOpen} 
        onOpenChange={setModalOpen}
        classNames={{
          backdrop: "bg-gradient-to-t from-white/80 to-white/50 backdrop-opacity-70" // Налаштування світлішого фону
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Details</ModalHeader>
              <ModalBody>
                {selectedRow && (
                  <EditAccumulation columns={columns} selectedRow={selectedRow} />
                )}
              </ModalBody>
              <ModalFooter>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default StockingTable;
