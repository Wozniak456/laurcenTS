'use client'

import { Area } from "@/components/accordion"
import { empty } from "@prisma/client/runtime/library";
import { batchInfo, poolInfo, disposalItem } from '@/types/app_types'

interface Pool{
    id: number,
    name: string
}

type PoolInfoProps = {
    poolInfo: poolInfo
}

type batch_qty = {
    batch_name: string | undefined,
    qty: number
  }


export default function PoolInfoComponent({poolInfo} : PoolInfoProps){
    
    return (
        <div className='bg-blue-200 p-2'>
            <p>Партія: { poolInfo.batch?.batch_name}</p>
            <p>Кількість: {poolInfo.batch?.qty}</p>
            <p>Сер. вага: { poolInfo.calc?.fish_weight}</p>       
        </div>
    );
}
