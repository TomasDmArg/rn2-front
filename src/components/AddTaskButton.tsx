import React from 'react';
import { Button } from '../components/ui/button';
import { Add01Icon } from 'hugeicons-react';

interface AddTaskButtonProps {
  onClick: () => void;
}

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onClick }) => {
  return (
    <section className='flex flex-col gap-3 w-full'> 
      <Button onClick={onClick} className='w-full h-16 rounded-2xl flex flex-row items-center gap-3 text-xl'>
        <Add01Icon className='mb-[-2px]'/> Agregar tarea
      </Button>
    </section>
  );
};

export default AddTaskButton;
