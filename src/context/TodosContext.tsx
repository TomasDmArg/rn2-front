/**
 * TodoProvider Component
 * 
 * This component provides a context for managing todos throughout the application.
 * It handles CRUD operations for todos, including creating, reading, updating, and deleting.
 * This component relies on the AuthContext for authentication tokens.
 * 
 * @component
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { useAuth } from './AuthContext';

/**
 * Represents a todo item
 */
interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

/**
 * Defines the shape of the TodoContext
 */
interface TodoContextType {
  todos: Todo[];
  createTodo: (title: string, description?: string) => Promise<Todo>;
  getTodos: (skip?: number, limit?: number) => Promise<Todo[]>;
  updateTodo: (id: number, updates: Partial<Todo>) => Promise<Todo>;
  deleteTodo: (id: number) => Promise<Todo>;
  toggleTodoCompleted: (id: number) => Promise<Todo>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      getTodos();
    }
  }, [token]);

  /**
   * Creates a new todo
   * 
   * @param {string} title - The title of the todo
   * @param {string} [description] - An optional description of the todo
   * @returns {Promise<Todo>} The created todo
   */
  const createTodo = async (title: string, description?: string): Promise<Todo> => {
    try {
      const response = await axios.post(`${BASE_URL}/todos/`, 
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newTodo = response.data;
      setTodos(prevTodos => [...prevTodos, newTodo]);
      return newTodo;
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  };

  /**
   * Fetches todos from the server
   * 
   * @param {number} [skip=0] - Number of todos to skip (for pagination)
   * @param {number} [limit=100] - Maximum number of todos to return
   * @returns {Promise<Todo[]>} Array of fetched todos
   */
  const getTodos = async (skip: number = 0, limit: number = 100): Promise<Todo[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/todos/?skip=${skip}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedTodos = response.data;
      setTodos(fetchedTodos);
      return fetchedTodos;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  };

  /**
   * Updates an existing todo
   * 
   * @param {number} id - The ID of the todo to update
   * @param {Partial<Todo>} updates - The fields to update
   * @returns {Promise<Todo>} The updated todo
   */
  const updateTodo = async (id: number, updates: Partial<Todo>): Promise<Todo> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/todos/${id}`, 
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedTodo = response.data;
      // Actualizar el estado inmediatamente para mejor UX
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? updatedTodo : todo)
      );
      
      return updatedTodo;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  };

  /**
   * Deletes a todo
   * 
   * @param {number} id - The ID of the todo to delete
   * @returns {Promise<Todo>} The deleted todo
   */
  const deleteTodo = async (id: number): Promise<Todo> => {
    try {
      const response = await axios.delete(`${BASE_URL}/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const deletedTodo = response.data;
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      return deletedTodo;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  };

  /**
   * Toggles the completed status of a todo
   * 
   * @param {number} id - The ID of the todo to toggle
   * @returns {Promise<Todo>} The updated todo
   */
  const toggleTodoCompleted = async (id: number): Promise<Todo> => {
    try {
      // Encontrar el todo actual y obtener su estado actual
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) {
        throw new Error("Todo not found");
      }

      // Actualizar el estado optimistamente para mejor UX
      setTodos(prevTodos => prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
      
      // Realizar la actualización en el servidor
      const response = await axios.put(
        `${BASE_URL}/todos/${id}`,
        { completed: !todoToToggle.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedTodo = response.data;
      
      // Si la respuesta del servidor es diferente, actualizar el estado
      setTodos(prevTodos => prevTodos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      
      return updatedTodo;
    } catch (error) {
      // Si hay un error, revertir el cambio optimista
      const todoToToggle = todos.find(todo => todo.id === id);
      if (todoToToggle) {
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === id ? { ...todo, completed: todoToToggle.completed } : todo
        ));
      }
      console.error("Error toggling todo completed status:", error);
      throw error;
    }
  };
  const value = {
    todos,
    createTodo,
    getTodos,
    updateTodo,
    deleteTodo,
    toggleTodoCompleted,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

/**
 * Custom hook to use the todo context
 * 
 * @returns {TodoContextType} The todo context value
 * @throws {Error} If used outside of TodoProvider
 */
export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};