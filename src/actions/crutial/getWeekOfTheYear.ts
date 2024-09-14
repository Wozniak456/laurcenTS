export function getWeekOfYear(date: Date): number {

    const startOfYear = new Date(Date.UTC(date.getFullYear(), 0, 1));
    // console.log('startOfYear', startOfYear)

    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    // console.log('pastDaysOfYear', pastDaysOfYear)

    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
    // console.log('сьогодні:', 'номер тижня:', weekNum)
    
    return weekNum;
}