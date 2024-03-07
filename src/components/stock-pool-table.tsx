export interface CalculationFor_10_days{
    records: {
        id: number,
        day: number,
        date: Date,
        feed_per_day: number,
        feed_per_feeding: number,
        doc_id: bigint
    }[],
    doc_id: bigint
}
export const CalculationShowPage: React.FC<CalculationFor_10_days> = ({ records, doc_id}) => {
    try{
        return(
            <div className="border p-2">
                <div className="flex m-4 justify-between center">
                    <h1 className="text-xl font-bold"></h1>
                    <div className="flex gap-4">
                        <form >
                            <button className="p-2 border rounded">Delete</button>
                        </form>
                    </div>
                </div>
                <table className="border mx-auto">
                    <thead>
                        <tr className="bg-blue-200">
                            <th className="border border-blue-500 px-4 py-2">Days</th>
                            <th className="border border-blue-500 px-4 py-2">Data</th>
                            <th className="border border-blue-500 px-4 py-2">Feed today</th>
                            <th className="border border-blue-500 px-4 py-2">Feed per feeding</th>
                            <th className="border border-blue-500 px-4 py-2">Doc Id</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr className="bg-gray-100" key={record.id}>
                            <td className="border border-blue-500 px-4 py-2">{record.day}</td>
                            <td className="border border-blue-500 px-4 py-2" style={{ width: 'auto', whiteSpace: 'nowrap' }}>{(record.date).toISOString().split("T")[0]}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.feed_per_day}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.feed_per_feeding}</td>
                            <td className="border border-blue-500 px-4 py-2">{(record.doc_id).toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
    catch(error){
        console.error("Error fetching batch data:", error);
    }
}