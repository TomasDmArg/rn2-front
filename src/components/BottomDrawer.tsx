import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from './ui/input';
import { Add01Icon } from 'hugeicons-react';
import { useTodos } from '@/context/TodosContext';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (text: string) => void;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({ isOpen, onClose, onAddTask }) => {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText.trim());
      setTaskText('');
      onClose();    
    }
  };

  return (
    <AnimatePresence>
      {isOpen && ( 
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm max-w-[500px] mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 py-12 max-w-[500px] mx-auto flex flex-col items-center justify-center gap-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "easeInOut", damping: 20, stiffness: 300 }}
          >
            <h2 className='text-2xl font-bold w-full text-center'>Agregar tarea:</h2>
            <p className='text-center'>En pocas palabras define que tienes que hacer</p>
            <form onSubmit={handleSubmit} className="space-y-6 w-full mt-10">
              <Input
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Pagar factura de Movistar..."
                className="w-full p-2 border rounded-md h-16 rounded-xl px-4"
              />
              <Button type="submit" className="w-full h-16 text-xl flex flex-row items-center gap-3 rounded-xl">
                    <Add01Icon /> Agregar tarea
                </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomDrawer;