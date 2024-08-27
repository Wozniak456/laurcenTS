import React from "react";
import { db } from "@/db";
import VendorsTable from '@/components/Vendors/vendors-table'
import NewVendorForm from '@/components/Vendors/new-vendor-form'

export default async function VendorsPage() {
    
  const vendors = await db.vendors.findMany({
    include:{
      items: {
        include:{
          itemtypes: true,
          feedtypes: true,
          units: true
        }
      }
    }
  });

  const feedTypes = await db.feedtypes.findMany()

  return (
    <>
        <NewVendorForm />
        <VendorsTable vendors={vendors} feedTypes={feedTypes}/>
    </>
    
  );
}
