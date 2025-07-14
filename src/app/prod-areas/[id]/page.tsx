import { db } from "@/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from "@/actions";

export const dynamic = "force-dynamic";

interface ProdAreaShowPageProps {
  params: {
    id: string;
  };
}

export default async function ProdAreaShowPage(props: ProdAreaShowPageProps) {
  let area;
  try {
    area = await db.productionareas.findFirst({
      where: { id: parseInt(props.params.id) },
    });

    if (!area) {
      notFound();
    }

    const deleteProdAreaAction = actions.deleteProdArea.bind(null, area.id);

    return (
      <div>
        <div className="flex m-4 justify-between center">
          <h1 className="text-xl font-bold">{area.name}</h1>
          <div className="flex gap-4">
            <Link
              href={`/prod-areas/${area.id}/edit`}
              className="p-2 border rounded"
            >
              Edit1
            </Link>
            <form action={deleteProdAreaAction}>
              <button className="p-2 border rounded">Delete</button>
            </form>
          </div>
        </div>
        <div className="p-3 border rounded bg-gray-200 border-gray-200">
          <label>
            <b>Description:</b>
          </label>
          <h2>{area.description}</h2>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching production area:", error);
  } finally {
    await db
      .$disconnect()
      .then(() => console.log("Disconnected from the database"))
      .catch((disconnectError) =>
        console.error("Error disconnecting from the database:", disconnectError)
      );
  }
}
