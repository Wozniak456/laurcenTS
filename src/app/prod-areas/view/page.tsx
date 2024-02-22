import { db } from "@/db";
import Link from "next/link";

export default async function AreasHome() {
  async function disconnectIdleSessions() {
    try {
      await db.$executeRaw`SELECT pg_terminate_backend(pid)
                             FROM pg_stat_activity
                             WHERE state = 'idle';`;
      console.log('Disconnected idle sessions successfully.');
    } catch (error) {
      console.error('Error disconnecting idle sessions:', error);
    }
  }

  async function connectAndDisconnect() {
      try {
        await disconnectIdleSessions();
        await db.$connect();
      } catch (error) {
        console.error('Error connecting to database:', error);
      } 
  }

  const areas = await db.productionareas.findMany();

  const renderedAreas  = areas.map((area) => {
    return(
      <Link 
        key={area.id} 
        href={`/prod-areas/${area.id}`}
        className="flex justify-between items-center p-2 border rounded"
      > 
        <div>{area.name}</div>
        <div>View</div>
      </Link>
    )
  })
  connectAndDisconnect();

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Production areas</h1>
        <Link href="/prod-areas/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {renderedAreas}
      </div>
    </div>
  );
}
