'use client'
import React, { useState } from 'react';
import PoolCreateForm from '@/components/create-pool-form';

interface Pool {
    id: number;
    name: string;
    prod_line_id: number;
}

export interface Line {
    id: number;
    name: string;
    pools: Pool[];
}

export interface Area {
    id: number;
    name: string;
    lines: Line[];
}

interface AccordionProps {
    sections: Area[];
}

export const Accordion: React.FC<AccordionProps> = ({ sections }) => {
    const [activeSection, setActiveSection] = useState<number | null>(null);
    const [activeLine, setActiveLine] = useState<number | null>(null);
    const [isCreateFormVisible, setCreateFormVisible] = useState(false);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

    const handleSectionClick = (sectionIndex: number) => {
        setActiveSection(prevActiveSection =>
            prevActiveSection === sectionIndex ? null : sectionIndex
        );
    };

    const handleLineClick = (lineIndex: number, lineId: number) => {
        setActiveLine(prevActiveLine =>
            prevActiveLine === lineIndex ? null : lineIndex
        );
        setSelectedLineId(prevLineId =>
            prevLineId === lineId ? null : lineId
        );
    };

    return (
        <div>
            {sections.map((section, sectionIndex) => (
                <div key={section.id}>
                    <div
                        onClick={() => handleSectionClick(sectionIndex)}
                        className={`cursor-pointer p-4 hover:bg-gray-700 bg-gray-800 text-white border flex justify-between`}
                    >
                        <div>{section.name}</div>
                        <div>{activeSection === sectionIndex ? "-" : "+"}</div>
                    </div>
                    
                    {activeSection === sectionIndex && (
                        <div className="p-4 bg-gray-100">
                            {section.lines.map((line, lineIndex) => (
                                <div key={line.id}>
                                    <div
                                        onClick={() => handleLineClick(lineIndex, line.id)}
                                        className={`w-full bg-white hover:bg-gray-100 border border-gray-300 p-4 cursor-pointer`}
                                    >
                                        {line.name}
                                    </div>
                                    {activeLine === lineIndex && (
                                        <div className="p-4 bg-gray-200 border mb-2 rounded-bl-lg rounded-br-lg">
                                            <div className='flex flex-col'>
                                                {selectedLineId === line.id && (
                                                    <div className='flex flex-col'>
                                                        <div className='flex justify-end'>
                                                            <button 
                                                                onClick={() => setCreateFormVisible(prevState => !prevState)}
                                                                className="bg-gray-500 hover:bg-yellow-900 text-white py-2 px-2 rounded mb-4 w-fit ">
                                                                Додати басейн
                                                            </button>
                                                        </div>
                                                        {isCreateFormVisible && <PoolCreateForm line={line.id} />}
                                                    </div>
                                                )}
                                                {line.pools.map((pool, poolIndex) => (
                                                    <div
                                                        key={pool.id}
                                                        className={`flex justify-between w-full bg-white hover:bg-gray-100 border border-gray-300 p-4 `}
                                                    >
                                                        <div>{pool.name}</div>
                                                        <button 
                                                            className='cursor-pointer border p-1 rounded'
                                                        >
                                                            Зарибити
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
