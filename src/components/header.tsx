'use client'

import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../public/icons/logo.svg';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();

    const today = new Date()

    return (
        <div className="flex justify-between items-center bg-gray-800 text-white px-8 py-4 shadow-lg mb-8">
            <div className="flex items-center gap-8">
                <Image src={Logo} alt="Logo" width={40} className="h-10" />
                <div className="flex gap-4 flex-wrap text-lg items-center">
                    <Link href="/feeding/view">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/feeding/view' ? 'text-blue-100' : ''}`}>Керування басейнами</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-500"></div>
                    <Link href="/batches/view">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/batches/view' ? 'text-blue-100' : ''}`}>Партії</span>
                    </Link>
                    {/* <div className="h-6 w-px bg-gray-500"></div>
                    <Link href="/feed-weight/view">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/feed-weight/view' ? 'text-blue-100' : ''}`}>Наважка на день</span>
                    </Link> */}
                    
                    
                    <div className="h-6 w-px bg-gray-500"></div> 
                    <Link href="/summary-feeding-table/week">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/summary-feeding-table/week' ? 'text-blue-100' : ''}`}>Тижневий звіт</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-500"></div>
                    <Link href={`/summary-feeding-table/day/${today.toISOString().split("T")[0]}`}>
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname.startsWith('/summary-feeding-table/day') ? 'text-blue-100' : ''}`}>Годування</span>
                    </Link>
                    
                    <div className="h-6 w-px bg-gray-500"></div>
                    <Link href="/purchtable/view">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/purchtable/view' ? 'text-blue-100' : ''}`}>Реєстрація приходу</span>
                    </Link>
                    
                    <div className="h-6 w-px bg-gray-500"></div>
                    <Link href="/realization/headers/view">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/realization/headers/view' ? 'text-blue-100' : ''}`}>Реєстрація відвантаження</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-500"></div>
                    <Link href="/accumulation/view">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/accumulation/view' ? 'text-blue-100' : ''}`}>Собівартість</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-500"></div>
                    <Link href="/leftovers/view">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/leftovers/view' ? 'text-blue-100' : ''}`}>Склад</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-500"></div>
                    <Link href="/general-summary/day-selection">
                        <span className={`cursor-pointer hover:text-blue-300 transition duration-300 ${pathname === '/general-summary/day-selection' ? 'text-blue-100' : ''}`}>111</span>
                    </Link>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <input 
                    type="text" 
                    placeholder="Пошук..." 
                    className="px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                {/* <div className="flex items-center gap-2">
                    <img src="/user-avatar.png" alt="User Avatar" className="h-8 w-8 rounded-full border-2 border-gray-700 hover:border-blue-500 transition duration-300" />
                    <span className="cursor-pointer hover:text-yellow-500 transition duration-300">Профіль</span>
                </div> */}
            </div>
        </div>
    );
}
