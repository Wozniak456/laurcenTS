export interface CalculationFor_10_days{
    records: {
        id: number,
        day: number,
        date: Date,
        feed_per_day: number,
        feed_per_feeding: number,
        doc_id: bigint
    }[],
    doc_id: bigint | null
}
export const CalculationShowPage: React.FC<CalculationFor_10_days> = ({ records, doc_id}) => {
    console.log('doc_id:', doc_id)
    
    try{
        if (!doc_id){
            return <div>Немає записів</div>
        }
        else{
        return(
            <div className="p-2">
                <div className="flex m-4 center">
                    <h1 className="text-xl font-bold text-center w-full">Розрахунок на 10 днів згідно із зарибленням за документом № {Number(doc_id)-1}</h1>
                    
                </div>
                <table className="border mx-auto">
                    <thead>
                        <tr className="bg-blue-200">
                            <th className="border border-blue-500 px-4 py-2">День, №</th>
                            <th className="border border-blue-500 px-4 py-2">Дата</th>
                            <th className="border border-blue-500 px-4 py-2">Корм на день, г</th>
                            <th className="border border-blue-500 px-4 py-2">Корм на годування, г</th>
                            {/* <th className="border border-blue-500 px-4 py-2">Doc Id</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {records
                        .filter(records => records.doc_id === doc_id)
                        .map((record) => (
                            <tr  key={record.id}>
                            <td className="border border-blue-500 px-4 py-2">{record.day}</td>
                            <td className="border border-blue-500 px-4 py-2" style={{ width: 'auto', whiteSpace: 'nowrap' }}>{(record.date).toISOString().split("T")[0]}</td>
                            <td className="border border-blue-500 px-4 py-2">{(record.feed_per_day).toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{(record.feed_per_feeding).toFixed(3)}</td>
                            {/* <td className="border border-blue-500 px-4 py-2">{(record.doc_id).toString()}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* <div className="flex justify-end mt-4">
                        <form >
                            <button className="p-2 border rounded">Delete</button>
                        </form>
                </div> */}
            </div>
        )}
    }
    catch(error){
        console.error("Error fetching batch data:", error);
    }
}