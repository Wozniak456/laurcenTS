'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { productionlines } from "@prisma/client";
import { useEffect, useState } from "react";

interface PoolCreatePageProps {
    line: number;
}

export default function PoolCreatePage({ line }: PoolCreatePageProps){
    const [formState, action] = useFormState(actions.createPool, {message: ''});
    
    return(
        <form className="container mx-auto px-4 m-4 max-w-[800px]" action={action}>
            <h3 className="font-bold m-3">Create a Pool</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="prod_line_id">
                        prod_line_id:
                    </label>
                    <input
                        name="prod_line_id"
                        className="border rounded p-2 w-full"
                        id="prod_line_id"
                        value={line}
                        readOnly>
                    </input>
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="name">
                        Name
                    </label>
                    <input 
                        name="name"
                        className="border rounded p-2 w-full"
                        id="name"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="description">
                        Description
                    </label>
                    <textarea 
                        name="description"
                        className="border rounded p-2 w-full"
                        id="description"
                    />
                </div>

                {
                    formState && formState.message ? (
                        <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
                            {formState.message}
                        </div>
                    ) : null
                }

                <button type="submit" className="rounded p-2 bg-blue-200">
                    Create
                </button>
            </div>
        </form>
    )
}