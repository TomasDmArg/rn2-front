import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TodoList from '../components/TodoList';
import AddTaskButton from '../components/AddTaskButton';
import BottomDrawer from '../components/BottomDrawer';
import { useTodos } from '@/context/TodosContext';

const Home: React.FC = () => {
  const { todos, createTodo, toggleTodoCompleted } = useTodos();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleToggleTodo = async (id: number) => {
    try {
      await toggleTodoCompleted(id);
    } catch (error) {
      console.error('Error toggling todo:', error);
      // Aquí podrías agregar alguna notificación al usuario si lo deseas
    }
  };

  const handleAddTodo = async (text: string) => {
    try {
      await createTodo(text);  // Se ejecuta cuando onAddTask es llamado
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="w-full h-full max-w-[500px] mx-auto flex flex-col items-center justify-between p-6 bg-gray-100">
          <Header />
          <TodoList todos={todos} onToggle={handleToggleTodo} />
          <AddTaskButton onClick={() => setIsDrawerOpen(true)} />
        </main>
        <BottomDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          onAddTask={handleAddTodo} 
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;