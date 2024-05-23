'use client'
import { useState } from 'react'

type PriorityFormType = {
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PriorityForm({setShowForm} : PriorityFormType) {
   
    function handleCloseModal() {
        setShowForm(prev => !prev);
    }

    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-2/3">
                <h2 className="text-lg font-semibold mb-4">Редагування пріоритетності</h2>
                <button className="hover:bg-blue-500 hover:text-white border font-bold py-2 px-4 rounded" 
                    onClick={handleCloseModal}>
                    Скасувати
                </button>
            </div>
        </div>
    )
}