

import React, { useState, useRef } from 'react';
import { Member } from '../types';
import { XCircleIcon } from './icons';
import { TASK_COLORS } from '../constants';

interface AddTaskModalProps {
  members: Member[];
  currentUser: Member;
  onClose: () => void;
  onAddTask: (taskData: { title: string; description: string; assignedToIds: string[]; dueDate: string; color: string }) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ members, currentUser, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToIds, setAssignedToIds] = useState([currentUser.id]);
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState(TASK_COLORS[0].name);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isList, setIsList] = useState(false);
  
  const descriptionRef = useRef<HTMLDivElement>(null);

  const handleAssigneeChange = (memberId: string) => {
    setAssignedToIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsList(document.queryCommandState('insertUnorderedList'));
  };
  
  const applyStyle = (command: string) => {
    document.execCommand(command, false);
    if(descriptionRef.current) {
        descriptionRef.current.focus();
        setDescription(descriptionRef.current.innerHTML);
        updateToolbarState();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && assignedToIds.length > 0 && dueDate) {
      onAddTask({ title, description, assignedToIds, dueDate, color });
    } else if (assignedToIds.length === 0) {
      alert('Please assign the task to at least one member.');
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
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <div className="mt-1 border border-slate-300 rounded-md">
                <div className="flex items-center p-1 border-b bg-slate-50 space-x-1">
                    <button type="button" onClick={() => applyStyle('bold')} className={`p-1 rounded font-bold w-6 h-6 flex items-center justify-center ${isBold ? 'bg-slate-300' : 'hover:bg-slate-200'}`}>B</button>
                    <button type="button" onClick={() => applyStyle('italic')} className={`p-1 rounded italic w-6 h-6 flex items-center justify-center ${isItalic ? 'bg-slate-300' : 'hover:bg-slate-200'}`}>I</button>
                    <button type="button" onClick={() => applyStyle('insertUnorderedList')} className={`p-1 rounded w-6 h-6 flex items-center justify-center ${isList ? 'bg-slate-300' : 'hover:bg-slate-200'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </button>
                </div>
                <div
                    id="description"
                    ref={descriptionRef}
                    onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                    onKeyUp={updateToolbarState}
                    onMouseUp={updateToolbarState}
                    contentEditable
                    className="w-full min-h-[100px] p-2 bg-white text-slate-900 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-700">Assign To</label>
                <div className="mt-1 border border-slate-300 rounded-md p-2 max-h-32 overflow-y-auto">
                    {members.map(member => (
                    <div key={member.id} className="flex items-center">
                        <input
                        type="checkbox"
                        id={`assignee-${member.id}`}
                        checked={assignedToIds.includes(member.id)}
                        onChange={() => handleAssigneeChange(member.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <label htmlFor={`assignee-${member.id}`} className="ml-2 block text-sm text-slate-900">{member.name}</label>
                    </div>
                    ))}
                </div>
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Due Date</label>
                <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" required />
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