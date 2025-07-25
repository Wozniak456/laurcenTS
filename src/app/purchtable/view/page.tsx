import { db } from "@/db";

import PurchTableComponent from "@/components/PurchHeaders/purchtable-table";
import { getPageTitle } from "@/utils/pageTitle";

export const metadata = {
  title: getPageTitle("Реєстрація приходу"),
};

export const dynamic = "force-dynamic";

export default async function PurchtableHome() {
  const purchtables = await db.purchtable.findMany({
    select: {
      id: true,
      doc_id: true,
      date_time: true,
      vendor_doc_number: true,
      vendor_id: true,
      vendors: {
        select: {
          id: true,
          name: true,
          description: true,
          items: true,
        },
      },
      purchaselines: {
        select: {
          id: true,
          item_id: true,
          units: true,
          quantity: true,
          items: {
            select: {
              id: true,
              name: true,
              feed_type_id: true,
            },
          },
        },
      },
    },
  });

  const vendors = await db.vendors.findMany();

  const items = await db.items.findMany({
    select: {
      id: true,
      name: true,
      units: true,
      vendor_id: true,
    },
  });

  return (
    <div>
      <PurchTableComponent
        purchtables={purchtables}
        vendors={vendors}
        items={items}
      />
    </div>
  );
}
