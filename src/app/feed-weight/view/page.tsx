import { db } from "@/db";
import LocationComponent from '@/components/DailyFeedWeight/location-info'
import * as feedingActions from "@/actions/feeding"
import * as stockingActions from "@/actions/stocking"
import * as actions from "@/actions"
import { calculationAndFeed, calculationAndFeedExtended } from '@/types/app_types'

interface DailyFeedWeightPageProps{
    date: string
}

//керування пріоритетностями та наважка на годування
export default async function DailyFeedWeightPage (today : DailyFeedWeightPageProps){
    try {
        const parsedDate = new Date(today.date);
        if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date format');
        }

        const lines = await db.productionlines.findMany({
            select:{
                id: true,
                pools:{
                    select:{
                        id: true,
                        locations:{
                            select:{
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        const summary = await feedingActions.getAllSummary(lines, new Date(today.date))
        const items = await db.items.findMany()

        return(
            <>
            <div className="flex justify-between my-4 mx-8">
                <h1 className="text-lg font-bold">Наважка на 1 годування</h1>
                <h1 className="text-lg font-bold">Зведена таблиця</h1>
            </div>
            
            <div className="flex justify-around min-h-screen content-start">
                <table className="w-1/2 bg-white rounded-lg shadow-lg">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border p-4">№ басейну</th>
                            <th className="border p-4">К-сть, г</th>
                            <th className="border p-4">Тип корму</th>
                            <th className="border p-4">Корм</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map(line => (
                            line.pools.map(pool => (
                                pool.locations.flatMap(async loc => {
                                    //перевірка чи локація не пуста
                                    const isPoolFilled = await feedingActions.isFilled(loc.id)
    
                                    let todayCalcExtended : calculationAndFeedExtended | undefined
                                    // let prevCalc;
                                    let prevCalcExtended : calculationAndFeedExtended | undefined
    
                                    if(isPoolFilled === true){
                                        const todayCalc : calculationAndFeed = await stockingActions.calculationForLocation(loc.id, today.date);
    
                                        if (todayCalc.feed && todayCalc.feed.type_id){
                                            todayCalcExtended = {
                                                ...todayCalc,
                                                allItems : await actions.getAllItemsForFeedType(todayCalc.feed.type_id)
                                            }
                                        }
                                   
                                        if (todayCalc.calc?.transition_day ){
                                            const prevCalc  = await stockingActions.getPrevCalc(loc.id, todayCalc);
    
                                            if (prevCalc && prevCalc.calc && prevCalc.feed?.type_id){
                                                prevCalcExtended = {
                                                    ...prevCalc,
                                                    allItems : await actions.getAllItemsForFeedType(prevCalc.feed?.type_id)
                                                }
                                            }
                                        }
                                    }
    
                                    return (
                                        <LocationComponent
                                            key={loc.id}
                                            location={{ id: loc.id, name: loc.name}}
                                            todayCalculation={todayCalcExtended}
                                            prevCalculation={prevCalcExtended}
                                        />
                                    );
                                })
                            ))
                        ))}
                    </tbody>
                </table>
                <table className="w-1/3 bg-white rounded-lg shadow-lg self-start">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border p-4">Корм</th>
                            <th className="border p-4">Кількість</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(summary).map(([itemId, summary]) => (
                            <tr key={itemId}>
                                <td className="px-4 h-10 border border-gray-400">{items.find(item => item.id === summary.uniqueItemId)?.name}</td>
                                <td className="px-4 h-10 border border-gray-400">{summary.totalFeed.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </>
        )

    }
    catch (error) {
        // Обробка помилок, якщо виникає проблема з датою або доступом до даних
        console.error('Помилка в DailyFeedWeightPage:', error);
        return <div>Помилка під час завантаження даних.</div>;
    }
}