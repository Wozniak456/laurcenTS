'use client'
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import FormButton from "../common/form-button";
import { Input } from "@nextui-org/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/table";
// import line from "next-auth/providers/line";

interface RegisteringGoodsProps{
    header?: {
        id: bigint;
        doc_id: bigint | null;
        date_time: Date;
        vendor_id: number;
        vendor_doc_number: string;
        vendors: {
            id: number;
            name: string;
            description: string | null;
        };
        purchaselines: {
            id: number;
            items: {
                id: number;
                name: string;
                feed_type_id: number | null;
            };
            quantity: number;
            units: {
                id: number;
                name: string;
            };
            item_id: number;
        }[];
    }
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RegisteringGoods({
    header,
    setShowForm
} : RegisteringGoodsProps){

    const handleCloseModal = () => {
        setShowForm(false);
    };


    const [formState, action] = useFormState(actions.registerGoodsInProduction, { message: '' });

    return(
        <div className="">
            {/* <div className="bg-white p-8 rounded shadow-lg w-3/5"> */}
            <div className="flex flex-start my-4">
                <h2 className="text-lg font-semibold">Реєстрація приходу товару</h2>
            </div>
            <form className="" action={action} onSubmit={handleCloseModal}>

                {/* <table className="min-w-full">
                    <thead>
                        <tr className="bg-blue-100 ">
                            <th scope="col" className="px-6 py-3 ">
                                Назва товару
                            </th>
                            <th scope="col" className="px-6 py-3 ">
                                К-сть
                            </th>
                            <th scope="col" className="px-6 py-3 ">
                                Од. Виміру
                            </th>
                            <th scope="col" className="px-6 py-3 ">
                                Назва партії
                            </th>
                            <th scope="col" className="px-6 py-3 ">
                            Дата придатності
                            </th>
                            <th scope="col" className="px-6 py-3 ">
                            Пакування, кг
                            </th>
                            <th scope="col" className="px-6 py-3 ">
                            Ціна, грн
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {header?.purchaselines.map((line, index) => (
                        <tr key={index}>
                            <td className="py-4">
                                <div className="text-sm text-gray-900">{line.items.name}</div>
                            </td>
                            <td className="px-6 py-4 ">
                                <div className="text-sm text-gray-900">{line.quantity}</div>
                            </td>
                            <td className="px-6 py-4 ">
                                <div className="text-sm text-gray-900">{line.units.name}</div>
                            </td>
                            <td className="px-6 py-4 ">
                                <div className="text-sm text-gray-900">
                                <input
                                        name={`batch_name_${line.id}`}
                                        className="border rounded p-2 w-full"
                                        id={`batch_name_${line.id}`}
                                        required
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 ">
                                <div className="text-sm text-gray-900">
                                <input
                                        name={`expire_date_${line.id}`}
                                        type="date"
                                        className="border rounded p-2 w-full"
                                        id={`expire_date_${line.id}`}
                                        required
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 max-w-32">
                                <div className="text-sm text-gray-900">
                                <input
                                        name={`packing_${line.id}`}
                                        className="border rounded p-2 w-full"
                                        id={`packing_${line.id}`}
                                        required
                                        type="number"
                                        min={0}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 max-w-32">
                                <div className="text-sm text-gray-900">
                                <input
                                        name={`price_${line.id}`}
                                        className="border rounded p-2 w-full"
                                        id={`price_${line.id}`}
                                        required
                                        type="number"
                                        min={0}
                                    />
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table> */}

                <Table aria-label="">
                    <TableHeader>
                        <TableColumn className="text-center">Item name</TableColumn>
                        <TableColumn className="text-center">Qty</TableColumn>
                        <TableColumn className="text-center">Unit</TableColumn>
                        <TableColumn className="text-center">Batch name</TableColumn>
                        <TableColumn className="text-center">Expiration date</TableColumn>
                        <TableColumn className="text-center">Packing</TableColumn>
                        <TableColumn className="text-center">Price</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {header ? header.purchaselines
                        .map((line, index) => (
                            <TableRow key={index}>
                                <TableCell className="text-center">{line.items.name}</TableCell>
                                <TableCell className="text-center">{line.quantity}</TableCell>
                                <TableCell className="text-center">{line.units.name}</TableCell>
                                <TableCell className="text-center">
                                    <Input 
                                        name={`batch_name_${line.id}`}
                                        placeholder="Назва партії"
                                        isRequired
                                        // isInvalid={!!formState?.errors?.delivery_date}
                                        // errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input 
                                        name={`expire_date_${line.id}`}
                                        type="date"
                                        isRequired
                                        // isInvalid={!!formState?.errors?.delivery_date}
                                        // errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input 
                                        name={`packing_${line.id}`}
                                        isRequired
                                        type="number"
                                        min={0}
                                        // isInvalid={!!formState?.errors?.delivery_date}
                                        // errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input 
                                        name={`price_${line.id}`}
                                        isRequired
                                        type="number"
                                        min={0}
                                        // isInvalid={!!formState?.errors?.delivery_date}
                                        // errorMessage={formState?.errors?.delivery_date?.join(', ') || ''}
                                    />
                                </TableCell>
                            </TableRow>
                            )) : 
                            <TableRow>
                                <TableCell className="text-center">2</TableCell>
                                <TableCell className="text-center">2</TableCell>
                                <TableCell className="text-center">2</TableCell>
                                <TableCell className="text-center">2</TableCell>
                                <TableCell className="text-center">2</TableCell>
                                <TableCell className="text-center">2</TableCell>
                                <TableCell className="text-center">2</TableCell>
                            </TableRow>}
                    </TableBody>
                </Table>
                    
                <input type="hidden" name="header_id" value={String(header?.id)} /> 
                <input type="hidden" name="vendor_id" value={String(header?.vendor_id)} /> 
                <div className="flex justify-end my-4">
                    <FormButton color="primary">
                        Зберегти
                    </FormButton>
                </div>
            </form>
                
            {/* </div> */}
            {formState && formState.message && (
                <div className="my-2 p-2 border rounded border-red-400">
                    {formState.message}
                </div>
            )}
        </div>
        
    )
}