import Link from 'next/link';

export default function Header() {
    return (
        <div className="flex justify-between items-center bg-gray-800 text-white p-2">
            <div className="flex gap-4 flex-wrap">
                {/* <Link href="/" className="text-sm">Головна</Link> */}
                <Link href="/prod-areas/view" className="text-sm">Виробничі секції</Link>
                {/* <Link href="/prod-lines/view" className="text-sm">Виробничі лінії</Link> */}
                {/* <Link href="/pools/view" className="text-sm">Басейни</Link> */}
                <Link href="/batches/view" className="text-sm">Партії</Link>
                {/* <Link href="/datatable/view" className="text-sm">Datatable</Link> */}
                <Link href="/calculation/view" className="text-sm">Розрахунок годування</Link>
                <Link href="/summary-feeding-table/week" className="text-sm">Годування на тиждень</Link>
                <Link href="/summary-feeding-table/day" className="text-sm">Годування на день</Link>
                <Link href="/feeding/view" className="text-sm">Зариблення</Link>
                <Link href="/general-summary/view" className="text-sm">Зведена 111</Link>
            </div>
        </div>
    );
}
