import Link from 'next/link';

export default function Header() {
    return (
        <div className="flex justify-between items-center bg-gray-800 text-white px-8 py-2">
            <div className="flex gap-4 flex-wrap text-lg">
                <Link href="/feed-weight/view" >Наважка на день</Link>

                <Link href="/feeding/view" >Зариблення</Link>

                <Link href="/summary-feeding-table/week">Годування на тиждень</Link>
                
                <Link href="/summary-feeding-table/day" >Годування на день</Link>
                
                <Link href="/batches/view" >Партії</Link>
                
                <Link href="/general-summary/view">Зведена 111</Link>

                <Link href="/purchtable/view" >Накладні</Link>

                <Link href="/leftovers/view" >Залишки</Link>

                <Link href="/realization/headers/view">Продаж</Link>
            </div>
        </div>
    );
}
