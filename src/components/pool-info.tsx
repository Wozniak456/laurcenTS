'use client'

import type {productionareas} from '@prisma/client'
import { useState } from 'react';
import * as actions from '@/actions';
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

    return(
        <div className='bg-blue-200'>
            {areas.map(area => (
                <div key={area.id}>
                    {area.lines.map(line => (
                        <div key={line.id}>
                            {line.pools.filter(pool => pool.id === poolItem.id).map(filteredPool => (
                                <div key={filteredPool.id}>
                                    {filteredPool.locations.map( loc => (
                                        <div key={loc.id}>
                                            {loc.itemtransactions.map(tran => (
                                                <div key={tran.id}>
                                                    <p>Партія: {tran.itembatches.name}</p>
                                                    <p>Кількість: {tran.quantity}</p>
                                                    {tran.documents.stocking.map(stock => (
                                                        <div key={stock.id}>
                                                            <p>Середня вага, г: {stock.average_weight}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}

        </div>
    )
}