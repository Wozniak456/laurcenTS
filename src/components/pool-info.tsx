'use client'

import { Area } from "@/components/accordion"
import { empty } from "@prisma/client/runtime/library";

interface Pool{
    id: number,
    name: string
}

interface PoolInfoProps{
    areas: Area[],
    poolItem: Pool
}

export default function PoolInfo({areas, poolItem} : PoolInfoProps){
    return (
        <div className='bg-blue-200'>
            {areas.map(area => (
                <div key={area.id}>
                    {area.lines.map(line => (
                        <div key={line.id}>
                            {line.pools.filter(pool => pool.id === poolItem.id).map(filteredPool => (
                                <div key={filteredPool.id}>
                                    {filteredPool.locations.map(loc => {
                                        return(
                                            <div key={loc.id}>
                                            {loc.itemtransactions.length > 0 && (
                                                <>
                                                    {loc.itemtransactions
                                                        .filter(tran => tran.documents.stocking.find(stock => stock.doc_id === tran.doc_id))
                                                        .sort((a, b) => Number(b.id) - Number(a.id))
                                                        .slice(0, 1)
                                                        .map(tran => {
                                                            return(
                                                                <>
                                                                    <p>Партія: {tran.itembatches.name}</p>
                                                                    <p>Кількість: {tran.quantity}</p>
                                                                    <p key={tran.id}>Сер. вага: {tran.documents.stocking[0].average_weight}</p>
                                                                </>
                                                            )
                                                        })}
                                                    
                                                    
                                                </>
                                            )}
                                        </div>
                                        )
                                        
})}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}