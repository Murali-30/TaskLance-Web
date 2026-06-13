import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  columnId: string;
}

const initialTasks: Task[] = [
  { id: 't1', title: 'Design Database Schema', columnId: 'backlog' },
  { id: 't2', title: 'Setup Authentication', columnId: 'in-progress' },
  { id: 't3', title: 'Create UI Components', columnId: 'in-progress' },
  { id: 't4', title: 'Write API Documentation', columnId: 'review' },
  { id: 't5', title: 'Initial Project Setup', columnId: 'done' },
];

const columns = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export default function ProjectKanban() {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    setTasks(prev => 
      prev.map(task => 
        task.id === draggedTaskId ? { ...task, columnId } : task
      )
    );
    setDraggedTaskId(null);
  };

  const handleAddTask = (columnId: string) => {
    const newTask = {
      id: `t${Date.now()}`,
      title: 'New Added Task',
      columnId
    };
    setTasks([...tasks, newTask]);
    addToast('Task added successfully.', 'success');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Task Tracker</h1>
        <p className="text-text-muted">Manage your tasks via Kanban board.</p>
      </div>

      <div className="flex-1 flex overflow-x-auto gap-6 pb-4">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-80 bg-surface-2 rounded-2xl flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-4 flex items-center justify-between border-b border-border-color">
              <h3 className="font-semibold">{column.title}</h3>
              <span className="text-sm font-medium bg-surface px-2 py-0.5 rounded-full text-text-muted">
                {tasks.filter(t => t.columnId === column.id).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {tasks.filter(t => t.columnId === column.id).map(task => (
                <motion.div
                  layout
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className="bg-surface p-4 rounded-xl border border-border-color shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">{task.title}</p>
                    <button className="text-text-muted hover:text-text-primary">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary text-[10px] text-white flex items-center justify-center font-bold">
                      T
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-border-color mt-auto">
              <button onClick={() => handleAddTask(column.id)} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors py-2 hover:bg-primary/5 rounded-lg">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
