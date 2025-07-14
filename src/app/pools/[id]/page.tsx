import { db } from "@/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from "@/actions";

export const dynamic = "force-dynamic";

interface PoolShowPageProps {
  params: {
    id: string;
  };
}

export default async function PoolShowPage(props: PoolShowPageProps) {
  let pool;
  try {
    pool = await db.pools.findFirst({
      where: { id: parseInt(props.params.id) },
    });

    if (!pool) {
      notFound();
    }

    const deletePoolAction = actions.deletePool.bind(null, pool.id);

    return (
      <div>
        <div className="flex m-4 justify-between center">
          <h1 className="text-xl font-bold">{pool.name}</h1>
          <div className="flex gap-4">
            <Link
              href={`/pools/${pool.id}/edit`}
              className="p-2 border rounded"
            >
              Edit
            </Link>
            <form action={deletePoolAction}>
              <button className="p-2 border rounded">Delete</button>
            </form>
          </div>
        </div>
        <div className="p-3 border rounded bg-gray-200 border-gray-200">
          <label>
            <b>Description:</b>
          </label>
          <h2>{pool.description}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>prod_line_id:</b>
          </label>
          <h2>{pool.prod_line_id}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>cleaning_frequency:</b>
          </label>
          <h2>{pool.cleaning_frequency}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>water_temperature:</b>
          </label>
          <h2>{pool.water_temperature}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>x_location:</b>
          </label>
          <h2>{pool.x_location}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>y_location:</b>
          </label>
          <h2>{pool.y_location}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>pool_height:</b>
          </label>
          <h2>{pool.pool_height}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>pool_width:</b>
          </label>
          <h2>{pool.pool_width}</h2>
        </div>
        <div className="p-3 border rounded border-gray-200">
          <label>
            <b>pool_length:</b>
          </label>
          <h2>{pool.pool_length}</h2>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching pool data:", error);
  } finally {
    await db
      .$disconnect()
      .then(() => console.log("Disconnected from the database"))
      .catch((disconnectError) =>
        console.error("Error disconnecting from the database:", disconnectError)
      );
  }
}
