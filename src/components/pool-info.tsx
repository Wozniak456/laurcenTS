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
                                            {loc.itemtransactions[0] && (
                                                <>
                                                    <p>Партія: {loc.itemtransactions[0].itembatches.name}</p>
                                                    <p>Кількість: {loc.itemtransactions[0].quantity}</p>
                                                    {loc.itemtransactions[0].documents.stocking.map((stock, index) => (
                                                        <div key={index}>
                                                            {index === 0 && (
                                                                <p>Середня вага, г: {stock.average_weight}</p>
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