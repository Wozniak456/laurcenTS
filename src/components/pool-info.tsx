'use client'

import { Area } from "@/components/accordion"

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
                                    {filteredPool.locations.map(loc => (
                                        <div key={loc.id}>
                                            {loc.itemtransactions.length > 0 && (
                                                <>
                                                    <p>Партія: {loc.itemtransactions[loc.itemtransactions.length - 1].itembatches.name}</p>
                                                    <p>Кількість: {loc.itemtransactions[loc.itemtransactions.length - 1].quantity}</p>
                                                    {loc.itemtransactions[loc.itemtransactions.length - 2].documents.stocking.map((stock, index) => (
                                                        <div key={index}> 
                                                            {index === 0 && (
                                                                <p>Середня вага, г: {stock.average_weight.toFixed(3)}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}