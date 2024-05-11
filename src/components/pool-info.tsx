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
    // const lines = areas.flatMap(area => (area.lines))
    // console.log('lines', lines)
    return (
        <div className='bg-blue-200'>
            {areas.map(area => (
                <div key={area.id}>
                    {area.lines.map(line => (
                        <div key={line.id}>
                            {line.pools.filter(pool => pool.id === poolItem.id).map(filteredPool => (
                                <div key={filteredPool.id}>
                                    {filteredPool.locations.map(loc => {
                                        const transactions = loc.itemtransactions
                                        .filter(tran =>(
                                            tran.itembatches.items.item_type_id === 1
                                        ))
                                        .sort((a, b) => Number(b.id) - Number(a.id));
                                        const totalQuantity = transactions.reduce((total, tran) => total + tran.quantity, 0);

                                        //console.log(transactions[0])
                                        //console.log(transactions[0].documents.stocking[0].average_weight)

                                        if(transactions.length > 0){
                                            return(
                                                <div key={loc.id}>
                                                    <p>Партія: {transactions[0].itembatches.name}</p>
                                                    <p>Кількість: {totalQuantity}</p>
                                                    {/* <p>Сер. вага: {transactions[0].documents}</p>        */}
                                                    <p>Сер. вага: {transactions[0].documents.stocking[0].average_weight}</p>       
                                                </div>
                                            )   
                                        }  
                                                                  
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
