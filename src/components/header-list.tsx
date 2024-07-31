'use client'

// import { useState } from 'react';
// import HeaderAuth from '@/components/header-auth'; // Ваш компонент авторизації
// import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
// import BatchCreatePage from '@/app/batches/new/page';

interface HeaderListProps{
    array: {
        label: string,
        href: string
    }[]
}

export default function HeaderList({ array }: HeaderListProps) { 
    return (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {array.map((item, index) => (
                <li key={index} className="flex items-center">
                    <a
                        href={item.href}
                        className="text-blue-500 hover:underline"
                    >
                        {item.label}
                    </a>
                </li>
            ))}
        </ul>
    );
}
