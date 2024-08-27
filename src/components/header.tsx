'use client'

import { useState } from 'react';
// import HeaderAuth from '@/components/header-auth'; // Ваш компонент авторизації
import { Button, Navbar, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import HeaderList from '@/components/header-list'

export default function Header() { 
    const today = new Date();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { label: 'Керування басейнами', href: '/pool-managing/view' },
        { label: 'Партії', href: '/batches/view' },
        { label: 'Тижневий звіт', href: '/summary-feeding-table/week' },
        { label: 'Годування', href: `/summary-feeding-table/day/${today.toISOString().split("T")[0]}` },
        { label: 'Реєстрація приходу', href: '/purchtable/view' },
        { label: 'Постачальники та корми', href: '/vendors/view' },
        // { label: 'Реєстрація відвантаження', href: '/realization/headers/view' },
        { label: 'Собівартість', href: '/accumulation/view' },
        { label: 'Склад', href: '/leftovers/view' },
        { label: '111', href: '/general-summary/day-selection' }
    ];

    return (
        <Navbar className="shadow mb-6 bg-white relative z-100">
                <div className='flex gap-4 items-center'>
                    <div className="font-bold text-inherit">LaursenAC</div>
            
                    <Popover placement='bottom-start' backdrop='blur'>
                        <PopoverTrigger>
                            <Button color='primary' className='z-1'>Menu</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full">
                            <HeaderList array={menuItems}/>
                        </PopoverContent>
                    </Popover>
                </div> 
                
                {/* <div className="flex justify-end p-4">
                    <HeaderAuth />
                </div> */}

            {isMenuOpen && (
                <div className="absolute bg-white border border-gray-300 shadow-lg p-4 mt-2 rounded w-full top-full left-0 z-100">
                    <div className="grid grid-cols-3 gap-4">
                        {menuItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-blue-500 hover:underline"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}

        </Navbar>
    );
}
