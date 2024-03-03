import { db } from "@/db"
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from '@/actions'

interface ProdLineShowPageProps {
    params: {
        id: string
    }
}

export default async function ProdLineShowPage(props: ProdLineShowPageProps){
    const line = await db.productionlines.findFirst({
        where: { id: parseInt(props.params.id) }
    })

    if (!line){
        notFound();
    }

    const deleteProdLineAction = actions.deleteProdLine.bind(null, line.id)

    const renderedPools = await db.pools.findMany({
        where: {prod_line_id: Number(props.params.id)}
    })

    return(
        <div>
            <div className="flex m-4 justify-between center">
                <h1 className="text-xl font-bold">{line.name}</h1>
                <div className="flex gap-4">
                    <Link href={`/prod-lines/${line.id}/edit`} className="p-2 border rounded">
                        Edit
                    </Link>
                    <form action={deleteProdLineAction}>
                        <button className="p-2 border rounded">Delete</button>
                    </form>
                </div>
            </div>
            <div className="p-3 border rounded bg-gray-200 border-gray-200">
                <h2>
                    ProductionAreaID: <b>{line.id}</b>
                </h2>
                <h2>
                    Name of production line: <b>{line.name}</b>
                </h2>
                <h2>
                    Description of production line: <b>{line.description}</b>
                </h2>
            </div>
            <div>
                {renderedPools.map(pool => (
                    <Link key={pool.id} href={`/pools/${pool.id}`}>
                        <div className="border p-3 mt-3 rounded block">
                            <h3 className="text-lg font-semibold">{pool.name}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}