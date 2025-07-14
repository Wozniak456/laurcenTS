import { db } from "@/db";
import ItemBatchCreateForm from "@/components/FishBatch/create-batch-form";

export const dynamic = "force-dynamic";

export default async function BatchCreatePage() {
  const items = await db.items.findMany({
    where: {
      item_type_id: {
        not: 3,
      },
    },
  });
  const units = await db.units.findMany();

  return <ItemBatchCreateForm items={items} units={units} />;
}
