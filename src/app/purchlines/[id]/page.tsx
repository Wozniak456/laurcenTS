import { db } from "@/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from "@/actions";

export const dynamic = "force-dynamic";

interface PurchLineShowPageProps {
  params: {
    id: string;
  };
}

export default async function PurchLineShowPage(props: PurchLineShowPageProps) {
  let purchline;
  try {
    purchline = await db.purchaselines.findFirst({
      where: { id: parseInt(props.params.id) },
    });

    if (!purchline) {
      notFound();
    }

    const deletePurchLineAction = actions.deletePurchLine.bind(
      null,
      purchline.id
    );

    return (
      <div>
        <div className="flex m-4 justify-between center">
          <h1 className="text-xl font-bold">{purchline.id}</h1>
          <div className="flex gap-4">
            <Link
              href={`/purchlines/${purchline.id}/edit`}
              className="p-2 border rounded"
            >
              Edit
            </Link>
            <form action={deletePurchLineAction}>
              <button className="p-2 border rounded">Delete</button>
            </form>
          </div>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>Purchase_id:</b>
          </label>
          <h2>{purchline.purchase_id.toString()}</h2>
        </div>
        <div className="p-3 border rounded bg-gray-200 border-gray-200">
          <label>
            <b>Item_transaction_id:</b>
          </label>
          <h2>{purchline.item_transaction_id?.toString()}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>ItemId:</b>
          </label>
          <h2>{purchline.item_id}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>Quantity:</b>
          </label>
          <h2>{purchline.quantity}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>UnitId:</b>
          </label>
          <h2>{purchline.unit_id}</h2>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching purchline data:", error);
  } finally {
    await db
      .$disconnect()
      .then(() => console.log("Disconnected from the database"))
      .catch((disconnectError) =>
        console.error("Error disconnecting from the database:", disconnectError)
      );
  }
}
