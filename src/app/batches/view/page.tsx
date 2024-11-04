'use client'
import BatchCreatePage from '@/components/FishBatch/create-batch-form'

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link} from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { itembatches } from '@prisma/client';
import * as actions from '@/actions'

export default function BatchesComponent() {  
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const [batches, setBatches] = useState<null | itembatches[]>(null)

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const batches = await actions.getBatches(1);
                setBatches(batches);
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };
    
        fetchBatches();
    }, []);


  return (
    <div className="container p-4 w-full bg-gray-100 rounded-lg mt-4">
      <div className='flex justify-end'>

        <Button onPress={onOpen} color="primary">Нова партія</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Нова партія</ModalHeader>
                <ModalBody>
                  <BatchCreatePage />
                </ModalBody>
                <ModalFooter>
                  
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      
      <div className="p-6">
          <div>
            {batches
            ?.sort((a, b) => Number(b.id) - Number(a.id))
            .map((batch, batchIndex) => (
              <Link 
              key={batchIndex}
              href={`/batches/${batch.id}`}
              className="flex justify-between items-center p-2 hover:bg-gray-200 border-b border-gray-300 pb-2"
              >
                <div>{batch.name}</div>
                <div className='text-sm text-gray-400'>Перегляд</div>
              </Link>
            ))}
          </div>
     
      </div>
    </div>
  );
};