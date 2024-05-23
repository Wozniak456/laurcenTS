
import {getCurrentFeedCountType} from '@/types/app_types'

type DailyFeedingWeightProps = {
    currentState: getCurrentFeedCountType[]
}

export default function DailyFeedingWeight({currentState} : DailyFeedingWeightProps) {
    return(
        <>
            <h1>Корми за замовчуванням</h1>
            <table className="border-collapse border border-gray-300 w-auto mx-auto mb-4 text-xs">
                <thead>
                    <tr className="bg-blue-200">
                        <th className="border border-gray-300 px-2 py-1 text-left">Вид корму</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Корм</th>
                    </tr>
                </thead>
                <tbody>
                    {currentState.map(row => (
                        <tr key={row.batch_id} className="even:bg-blue-50">
                            <td className="px-2 py-1 border border-gray-300">{row.feed_type_id?.name}</td>
                            <td className="px-2 py-1 border border-gray-300">{row.item_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}