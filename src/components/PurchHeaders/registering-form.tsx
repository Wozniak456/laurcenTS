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
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Link} from "@nextui-org/react";


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
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return(
        
        <>
        <Button onPress={onOpen} color="default">Register</Button>
                <Modal 
                    size="4xl"
                    isOpen={isOpen} 
                    onOpenChange={onOpenChange}
                    placement="top-center"
                >
                    <ModalContent>
                    {(onClose) => (
                        <>
                        <ModalHeader className="flex flex-col gap-1"></ModalHeader>
                        <ModalBody>
                        <div className="">
                            <div className="flex flex-start my-4">
                                <h2 className="text-lg font-semibold">Реєстрація приходу товару</h2>
                            </div>
                            <form className="" action={action} onSubmit={handleCloseModal}>

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
                                                        step="0.01"
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
                        </ModalBody>
                        <ModalFooter>
                        </ModalFooter>
                        </>
                    )}
                    </ModalContent>
                </Modal>
        </>
    )
}