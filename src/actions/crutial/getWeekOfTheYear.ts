export function getWeekOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;

    // Повертаємо номер тижня, додаючи 1, щоб врахувати частковий тиждень на початку року
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}