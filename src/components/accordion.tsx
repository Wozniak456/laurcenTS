'use client'
import React, { useEffect, useState } from 'react';
import PoolCreateForm from '@/components/create-pool-form';
import PoolStockForm from '@/components/stocking-form'
import {CalculationShowPage} from '@/components/stock-pool-table'
import {getFeedForFish} from '@/actions'
import { redirect } from 'next/navigation';

export interface FeedConnection{
    id: number;
    feed_id: number;
    from_fish_weight: number;
    to_fish_weight: number;
    item: Item
}

interface Item{
    id: number,
    name: string
}

interface Stocking{
    id: number,
    average_weight: number
}

interface Document{
    id: bigint,
    doc_type_id: number | null,
    stocking: Stocking[]
}

export interface ItemBatch{
    id: bigint,
    name: string
}
interface Transaction{
    id: bigint,
    itembatches: ItemBatch,
    documents: Document,
    quantity: number
}

export interface Location {
    id: number;
    name: string;
    itemtransactions: Transaction[]
}

interface Pool {
    id: number;
    name: string;
    prod_line_id: number;
    locations: Location[]
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
    sections: Area[],
    feedConnections: FeedConnection[],
    locations: {
        id: number,
        name: string,
        pool_id: number | null
    }[],
    itembatches: {
        id: bigint,
        name: string
    }[],
    calculation: {
        id: number,
        day: number,
        date: Date,
        feed_per_day: number,
        feed_per_feeding: number,
        doc_id: bigint
    }[]
}

export const Accordion: React.FC<AccordionProps> = ({ sections, feedConnections, locations, itembatches, calculation}) => {
    const [activeSection, setActiveSection] = useState<number | null>(null);
    const [activeLine, setActiveLine] = useState<number | null>(null);
    const [isCreatePoolFormVisible, setCreatePoolFormVisible] = useState(false);
    const [isStockPoolFormVisible, setStockPoolFormVisible] = useState(false);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
    const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
    const [isStockPoolTableVisible, setStockPoolTableVisible] = useState(false);
    const [locationId, setlocationId] = useState<number | null>(null);
    const [docId, setdocId] = useState<bigint | null>(null);

  
    const handleSectionClick = (sectionIndex: number) => {
        setActiveSection(prevActiveSection =>
            prevActiveSection === sectionIndex ? null : sectionIndex
        );
        
        setCreatePoolFormVisible(false);
        setStockPoolFormVisible(false);
        setStockPoolTableVisible(false)
        setSelectedPoolId(null)
    };
    

    const handleLineClick = (lineIndex: number, lineId: number) => {
        setActiveLine(prevActiveLine =>
            prevActiveLine === lineIndex ? null : lineIndex
        );
        setSelectedLineId(prevLineId =>
            prevLineId === lineId ? null : lineId
        );
        setSelectedPoolId(null)
        setStockPoolFormVisible(false);
        setCreatePoolFormVisible(false)
        setStockPoolTableVisible(false)
    };

    const handleStockButtonClick = (poolId : number) => {
        setSelectedPoolId(poolId); // Встановлюємо вибраний басейн
        setStockPoolFormVisible(prevState => !prevState); // Змінюємо стан на протилежний
        setStockPoolTableVisible(false)
    };

    const handleCalculationButtonClick = () => {
        setStockPoolTableVisible(prevState => !prevState);
    }
    
    // const closeStockPoolForm = () => {
    //     setStockPoolFormVisible(false); // Ховаємо форму для зариблення
    //     setSelectedPoolId(null); // Скидаємо вибраний басейн
    // };

    const handlePoolClick = (poolId: number) => {
        setSelectedPoolId(prevPoolId => (prevPoolId === poolId ? null : poolId));
        setStockPoolFormVisible(false);
        setStockPoolTableVisible(false)
        
        const locId = locations.find(location => location.pool_id === poolId);
        
        if (locId) {
            setlocationId(locId.id)
        } else {
            setlocationId(null)
        }

        let document: Document | undefined;

        sections.forEach(section => {
            section.lines.forEach(line => {
                const pool = line.pools.find(pool => pool.id === poolId);
                if (pool) {
                    pool.locations.forEach(location => {
                        location.itemtransactions.forEach(transaction => {
                            if (transaction.documents.doc_type_id === 1) {
                                document = transaction.documents;
                            } else {
                                console.log('Документ з doc_type_id === 1 не знайдено для транзакції', transaction.id);
                            }
                        });
                    });
                }
            });
        });
        if (document?.id !== BigInt(-1) && document) {
            setdocId(document.id)
            console.log('Останній документ з doc_type_id === 1 знайдено:', document);
        } else {
            setdocId(null)
            console.log('Документ з doc_type_id === 1 не знайдено');
        }
    };
    

    
    let allStockingWeights: number[] = [];

    sections.forEach(area => {
        area.lines.forEach(line => {
            line.pools.forEach(pool => {
                pool.locations.forEach(location => {
                    location.itemtransactions.forEach(transaction => {
                        transaction.documents.stocking.forEach(stocking => {
                            allStockingWeights.push(stocking.average_weight);
                        });
                    });
                });
            });
        });
    });
    
    let dictionary = new Map<number, string>(); 

    allStockingWeights.forEach(stockingWeight => {
        const connection = feedConnections.find(connection => {
            return stockingWeight >= connection.from_fish_weight && stockingWeight <= connection.to_fish_weight;
        });

        if (connection) {
            dictionary.set(stockingWeight, connection.item.name);
        }
    });
    useEffect(() => {
        console.log('selectedPoolId = ', selectedPoolId);
        console.log('locationId = ', locationId);
        console.log('docId', docId)
    }, [selectedPoolId, locationId, docId]);
    
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
                                                                onClick={() => setCreatePoolFormVisible(prevState => !prevState)}
                                                                className="bg-gray-500 hover:bg-yellow-900 text-white py-2 px-2 rounded mb-4 w-fit ">
                                                                Додати басейн
                                                            </button>
                                                        </div>
                                                        {isCreatePoolFormVisible && <PoolCreateForm line={line.id} />}
                                                    </div>
                                                )}
                                                {line.pools.map((pool, poolIndex) => (
                                                <div
                                                    key={pool.id}
                                                    className={`flex flex-col w-full bg-white border border-gray-300 p-4 `}
                                                    onClick={() => 
                                                        handlePoolClick(pool.id)
                                                    }
                                                >
                                                    <div className='cursor-pointer'>{pool.name}</div>
                                                    
                                                    {selectedPoolId === pool.id && (
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <div>
                                                                {pool.locations.map((location) => (
                                                                    <div key={location.id}>{location.itemtransactions.map((transaction) => (
                                                                        <div key={transaction.id} className='flex flex-col gap-2 border mt-2 mb-2 p-1 bg-blue-100 rounded'>
                                                                            <div>Назва партії: <b>{transaction.itembatches.name}</b></div>
                                                                            <div>DocID: {Number(transaction.documents.id)}</div>
                                                                            <div>Кількість: <b>{transaction.quantity}</b></div>
                                                                            <div>{transaction.documents.stocking.map(stocking => {
                                                                                return (
                                                                                    <div key={stocking.id} className='flex flex-col gap-2'>
                                                                                        <div>Вага: <b>{stocking.average_weight}</b> г</div>
                                                                                        <div>Назва корму: <b>{dictionary.get(stocking.average_weight)}</b></div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                            </div>
                                                                        </div>
                                                                    ))}</div>
                                                                ))}
                                                            </div>
                                                            <div className='flex justify-end gap-2'>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCalculationButtonClick();
                                                                    }}
                                                                    className='cursor-pointer border p-1 rounded hover:bg-gray-100 '
                                                                >
                                                                    Розрахунок
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleStockButtonClick(pool.id);
                                                                    }}
                                                                    className='cursor-pointer border p-1 rounded hover:bg-gray-100 '
                                                                >
                                                                    Зарибити
                                                                </button>
                                                            </div>
                                                            {selectedPoolId === pool.id && isStockPoolFormVisible && (
                                                                <PoolStockForm poolId={selectedPoolId} locations={locations} batches={itembatches}/>
                                                            )}
                                                            {selectedPoolId === pool.id && isStockPoolTableVisible && (
                                                                <CalculationShowPage records={calculation} doc_id={docId ? docId + BigInt(1) : null} />
                                                            )}

                                                        </div>
                                                    )}
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
