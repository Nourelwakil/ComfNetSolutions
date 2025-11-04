import React, { useState } from 'react';
import { Member } from '../types';
import { XCircleIcon } from './icons';
import { TASK_COLORS } from '../constants';

interface AddTaskModalProps {
  members: Member[];
  currentUser: Member;
  onClose: () => void;
  onAddTask: (taskData: { title: string; description: string; assignedToId: string; dueDate: string; color: string }) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ members, currentUser, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState(currentUser.id);
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState(TASK_COLORS[0].name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && assignedToId && dueDate) {
      onAddTask({ title, description, assignedToId, dueDate, color });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold text-slate-800">Add New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-black" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-black"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700">Assign To</label>
                <select id="assignedTo" value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-black">
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Due Date</label>
                <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-black" required />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Color</label>
              <div className="mt-2 flex space-x-2">
                {TASK_COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`w-8 h-8 rounded-full border-2 ${c.bgClassName} ${color === c.name ? 'ring-2 ring-offset-2 ring-brand-primary' : ''}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-brand-primary-dark">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;