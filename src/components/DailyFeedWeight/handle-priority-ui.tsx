'use client'

import { useState } from 'react'
import PriorityForm from '@/components/DailyFeedWeight/priority-form'

export default function HandlePriorityComponent() {
    const [showForm, setShowForm] = useState<boolean>(false)
    
    function handleButtonClick() {
        setShowForm(prev => !prev); // Змінюємо showForm на протилежне значення
    }

    return(
        <>
            <button className="bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleButtonClick}>
                    Налаштування пріоритетності
            </button>

            {showForm && <PriorityForm setShowForm={setShowForm}/>}
        </>
    )
}