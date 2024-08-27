'use client'

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import EditForm from "./vendor-edition";
import DeleteForm from "./vendor-delete";
import NewItemForm from "./new-item-form";
import EditItemForm from "./item-edition";
import DeleteItemForm from "./item-delete";

type Item = {
  id: number;
  name: string;
  description: string | null;
  item_type_id: number | null;
  feed_type_id: number | null;
  default_unit_id: number | null;
  parent_item: number | null;
  vendor_id: number | null;
  itemtypes: {
    id: number;
    name: string;
  } | null;
  feedtypes: {
    id: number;
    name: string;
    feedconnection_id: number | null;
  } | null;
  units: {
    id: number;
    name: string;
} | null;
};

type Vendor = {
  id: number;
  name: string;
  description: string | null;
  items: Item[];
};

type FeedType = {
  id: number;
  name: string;
  feedconnection_id: number | null;
}



type VendorsPageProps = {
  vendors: Vendor[];
  feedTypes: FeedType[]
};

export default function VendorsPage({ vendors, feedTypes }: VendorsPageProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>(undefined);

  const handleSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all" || keys.size === 0) {
      setSelectedVendor(undefined);
      return;
    }

    const selectedId = Array.from(keys)[0]; // беремо перший ключ із Set
    const selectedVendor = vendors.find((vendor) => vendor.id === Number(selectedId));
    setSelectedVendor(selectedVendor);
  };

  return (
    <div className="flex flex-col gap-3">
      <Table
        selectionMode="single"
        aria-label="Vendors table"
        onSelectionChange={handleSelectionChange}
      >
        <TableHeader>
          <TableColumn className="text-center">№</TableColumn>
          <TableColumn className="text-center">Назва</TableColumn>
          <TableColumn className="text-center">Опис</TableColumn>
          <TableColumn className="text-center">Редагування</TableColumn>
        </TableHeader>
        <TableBody>
          {vendors
          .sort((a, b) => a.id - b.id)
          .map((vendor, vendorIndex) => (
            <TableRow key={vendor.id}>
              <TableCell className="text-center">{vendorIndex + 1}</TableCell>
              <TableCell className="text-center">{vendor.name}</TableCell>
              <TableCell className="text-center">{vendor.description || "No description"}</TableCell>
              <TableCell className="flex gap-4 w-full justify-center">
                <EditForm vendor={vendor} />
                <DeleteForm vendor={vendor} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedVendor && (
        <div className="mt-4">
          <NewItemForm 
            vendor={vendors.find(vendor => vendor.id == selectedVendor.id)} 
            feedTypes={feedTypes}
          />
          <h2 className="text-lg font-bold my-4">Товари від постачальника {selectedVendor.name}</h2>
          <Table 
            aria-label="Vendor's items"
            selectionMode="single"
            // defaultSelectedKeys={["2"]} 
          >
            <TableHeader>
              <TableColumn className="text-center">№</TableColumn>
              <TableColumn className="text-center">Назва</TableColumn>
              <TableColumn className="text-center">Опис</TableColumn>
              <TableColumn className="text-center">Тип товару</TableColumn>
              <TableColumn className="text-center">Тип корму</TableColumn>
              <TableColumn className="text-center">Од. виміру</TableColumn>
              <TableColumn className="text-center">Редагування</TableColumn>
            </TableHeader>
            <TableBody>
              {selectedVendor.items
              .sort((a, b) => a.id - b.id)
              .map((item, itemIndex) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{itemIndex + 1}</TableCell>
                  <TableCell className="text-center">{item.name}</TableCell>
                  <TableCell className="text-center">{item.description || "No description"}</TableCell>
                  <TableCell className="text-center">{item.itemtypes?.name || "N/A"}</TableCell>
                  <TableCell className="text-center">{item.feedtypes?.name || "N/A"}</TableCell>
                  <TableCell className="text-center">{item.units?.name || "N/A"}</TableCell>
                  <TableCell className="flex gap-4 w-full justify-center">
                    <EditItemForm item={item} feedTypes={feedTypes} />
                    <DeleteItemForm item={item} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
