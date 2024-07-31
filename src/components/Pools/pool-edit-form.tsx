'use client'
import type {pools} from '@prisma/client'
import { useState } from 'react';
import * as actions from '@/actions';

interface PoolEditFormProps{
    pool: pools
}

export default function PoolEditForm({pool: pool} : PoolEditFormProps){
    const [description, setDescription] = useState(pool.description || '');
    const [cleaning_frequency, setCleaningFrequency] = useState(pool.cleaning_frequency)
    const [water_temperature, setWaterTemperature] = useState(pool.water_temperature)
    const [x_location, setXLocation] = useState(pool.x_location)
    const [y_location, setYLocation] = useState(pool.y_location)
    const [pool_height, setPoolHeight] = useState(pool.pool_height)
    const [pool_width, setPoolWidth] = useState(pool.pool_width)
    const [pool_length, setPoolLength] = useState(pool.pool_length)

    const editPoolAction = actions.editPool.bind(null, pool.id, description, cleaning_frequency, water_temperature, x_location, y_location, pool_height, pool_width, pool_length)

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleClFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCleaningFrequency(parseInt(event.target.value));
    };

    const handleWatTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWaterTemperature(parseInt(event.target.value));
    };

    const handleXLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setXLocation(parseInt(event.target.value));
    };

    const handleYLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setYLocation(parseInt(event.target.value));
    };

    const handlePoolHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPoolHeight(parseInt(event.target.value));
    };

    const handlePoolWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPoolWidth(parseInt(event.target.value));
    };

    const handlePoolLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPoolLength(parseInt(event.target.value));
    };

    return(
        <div className="p-3 border rounded border-gray-200">
            <form action={editPoolAction} className='flex flex-col'>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="description">
                        Description
                    </label>
                    <textarea 
                    id="description" 
                    name="description"
                    defaultValue={description !== null ? description.toString() : ''} 
                    onChange={handleDescriptionChange}
                    className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="cleaning_frequency">
                        cleaning_frequency
                    </label>
                    <input 
                    id="cleaning_frequency" 
                    name="cleaning_frequency"
                    defaultValue={cleaning_frequency != null ? cleaning_frequency : 0} 
                    onChange={handleClFrequencyChange}
                    className='p-3 border border-gray-200'
                    />
                </div>
                
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="water_temperature">
                    water_temperature
                    </label>
                    <input 
                    id="water_temperature" 
                    name="water_temperature"
                    defaultValue={water_temperature != null? water_temperature : 0} 
                    onChange={handleWatTemperatureChange}
                    className='p-3 border border-gray-200'
                />
                </div>
                
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="x_location">
                    x_location
                    </label>
                    <input 
                    id="x_location" 
                    name="x_location"
                    defaultValue={x_location !== null ? x_location.toString() : ''} 
                    onChange={handleXLocationChange}
                    className='p-3 border border-gray-200'
                    />
                </div>
                
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="y_location">
                    y_location
                    </label>
                    <input 
                    id="y_location" 
                    name="y_location"
                    defaultValue={y_location !== null ? y_location.toString() : ''} 
                    onChange={handleYLocationChange}
                    className='p-3 border border-gray-200'
                />
                </div>
                
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="pool_height">
                    pool_height
                    </label>
                    <input 
                    id="pool_height" 
                    name="pool_height"
                    defaultValue={pool_height !== null ? pool_height.toString() : ''} 
                    onChange={handlePoolHeightChange}
                    className='p-3 border border-gray-200'
                />
                </div>

                <div className="flex gap-4">
                    <label className="w-24" htmlFor="pool_width">
                    pool_width
                    </label>
                    <input 
                    id="pool_width" 
                    name="pool_width"
                    defaultValue={pool_width !== null ? pool_width.toString() : ''} 
                    onChange={handlePoolWidthChange}
                    className='p-3 border border-gray-200'
                />
                </div>

                <div className="flex gap-4">
                    <label className="w-24" htmlFor="pool_length">
                    pool_length
                    </label>
                    <input 
                    id="pool_length" 
                    name="pool_length"
                    defaultValue={pool_length !== null ? pool_length.toString() : ''} 
                    onChange={handlePoolLengthChange}
                    className='p-3 border border-gray-200'
                />
                </div>
                
                
                <button type='submit' className='p-2 border rounded'>
                    Save
                </button>
            </form>
            
        </div>
    )
}