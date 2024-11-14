import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => Promise<void>;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle }) => {
  return (
    <section className='flex-grow w-full overflow-y-auto mt-6 mb-6'>
      {todos.map(todo => (
        <Card key={todo.id} className="mb-3">
          <CardContent 
            onClick={() => onToggle(todo.id)} 
            className="flex items-center p-4 cursor-pointer hover:scale-[0.99] transition-all"
          >
            <Button
              variant="ghost"
              className="p-0 mr-2 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(todo.id);
              }}
            >
              {todo.completed ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </Button>
            <span className={`flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};

export default TodoList;