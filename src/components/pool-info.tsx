'use client'

import { Area } from "@/components/accordion"
import { empty } from "@prisma/client/runtime/library";

interface Pool{
    id: number,
    name: string
}

interface PoolInfoProps{
    poolInfo: {
        batch: batch_qty | null;
        calc: {
            fish_weight: number;
        } | null;
        feed_type_id: string | null | undefined;
    }
}

type batch_qty = {
    batch_name: string | undefined,
    qty: number
  }


export default function PoolInfo({poolInfo} : PoolInfoProps){
    
    return (
        <div className='bg-blue-200'>
            <p>Партія: {poolInfo.batch?.batch_name}</p>
            <p>Кількість: {poolInfo.batch?.qty}</p>
            <p>Сер. вага: {poolInfo.calc?.fish_weight}</p>       
        </div>
    );
}
