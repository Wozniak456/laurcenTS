'use server'
import { db } from "@/db";

export async function getItemPerType(feed_type_id : number, location_id : number) {

    const items = await db.items.findMany({
      where:{
        feed_type_id : feed_type_id
      }
    })
  
    //якщо немає колізій, то повертаємо єдиний корм для виду
    if(items.length == 1){
      return{
        item_id: items[0].id,
        item_name: items[0].name,
        definedPrio: true
      }
    }
  
    //якщо колізія є, то обираємо корм
    if (items.length > 1){
      const prio = await db.priorities.findFirst({
        select:{
          id: true,
          item_id: true,
          items:{
            select:{
              name: true
            }
          },
          batch_id:true,
          location_id: true,
          priority: true
        },
        where:{
          location_id: location_id
        },
        orderBy:{
          id: 'desc'
        }
      })
  
      //якщо для басейну обрано корм, повертаємо його
      if (prio){
        return{
          item_id: prio.item_id,
          item_name: prio.items?.name,
          definedPrio: true
        }
      }
      //якщо для басейну не обрано корм, повертаємо перший елемент
      else{
        return{
          item_id: items[0].id,
          definedPrio: false
        }
      }
    }
}