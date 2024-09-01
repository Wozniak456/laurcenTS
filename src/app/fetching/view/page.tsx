import { db } from "@/db";

import { FetchingReasons } from "@/types/fetching-reasons";
import FetchingInfoTable from "@/components/fetching-summary-table";
import { getWeekOfYear } from "@/actions";

type FetchingInfo = {
    locationName: string,
    locationId: number,
    commercialFishingAmount: number,
    commercialFishingWeight: number,
    sortedAmount: number,
    sortedWeight: number,
    growOutAmount: number,
    growOutWeight: number,
    moreThan500Amount: number,
    moreThan500Weight: number,
    lessThan500Amount: number,
    lessThan500Weight: number,
    weekNum: number
}

export default async function FetchingPage(){

    const weekNum = getWeekOfYear(new Date())

    const locations = await db.locations.findMany({
        include:{
            documents:{
                include:{
                    itemtransactions: {
                        include:{
                            fetching: {
                                where:{
                                    weekNumber: weekNum
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    

    // Об'єкт для зберігання акумульованих даних по кожному location
    const locationFetchingInfo: { [locationName: string]: FetchingInfo } = {};

    const summary: { [locationName: string]: FetchingInfo } = {};

    locations.flatMap(loc => {
        // Ініціалізуємо об'єкт для акумуляції для конкретного location
        locationFetchingInfo[loc.name] = {
            locationName: loc.name,
            locationId: loc.id,
            commercialFishingAmount: 0,
            commercialFishingWeight: 0,
            sortedAmount: 0,
            sortedWeight: 0,
            growOutAmount: 0,
            growOutWeight: 0,
            moreThan500Amount: 0,
            moreThan500Weight: 0,
            lessThan500Amount: 0,
            lessThan500Weight: 0,
            weekNum: weekNum
        };
    
        loc.documents.flatMap(doc => {
            doc.itemtransactions.forEach(tran => {
                if (tran.fetching.length > 0) {
                    tran.fetching.forEach(fetch => {
                        switch (fetch.fetching_reason) {
                            case FetchingReasons.CommercialFishing:
                                locationFetchingInfo[loc.name].commercialFishingAmount = tran.quantity;
                                locationFetchingInfo[loc.name].commercialFishingWeight = fetch.total_weight;
                                break;
                            case FetchingReasons.Sorted:
                                locationFetchingInfo[loc.name].sortedAmount = tran.quantity;
                                locationFetchingInfo[loc.name].sortedWeight = fetch.total_weight;
                                break;
                            case FetchingReasons.GrowOut:
                                locationFetchingInfo[loc.name].growOutAmount = tran.quantity;
                                locationFetchingInfo[loc.name].growOutWeight = fetch.total_weight;
                                break;
                            case FetchingReasons.MoreThan500:
                                locationFetchingInfo[loc.name].moreThan500Amount = tran.quantity;
                                locationFetchingInfo[loc.name].moreThan500Weight = fetch.total_weight;
                                break;
                            case FetchingReasons.LessThan500:
                                locationFetchingInfo[loc.name].lessThan500Amount = tran.quantity;
                                locationFetchingInfo[loc.name].lessThan500Weight = fetch.total_weight;
                                break;
                        }
                    });
                }
            });
        });

        const sum = locationFetchingInfo[loc.name].commercialFishingAmount 
        + locationFetchingInfo[loc.name].sortedAmount + locationFetchingInfo[loc.name].growOutAmount 
        + locationFetchingInfo[loc.name].moreThan500Amount + locationFetchingInfo[loc.name].lessThan500Amount

        if(sum > 0){
            summary[loc.name] = locationFetchingInfo[loc.name]
        }
    });

    const summaryArray: FetchingInfo[] = Object.values(summary);

    return(
        <>
          <FetchingInfoTable summary={summaryArray} weekNum={weekNum} /> 
        </>
    )
}