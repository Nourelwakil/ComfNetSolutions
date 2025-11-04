
import React from 'react';
import { Task, Member, Status } from '../types';
import StatusBadge from './StatusBadge';
import { PlusIcon } from './icons';
import { STATUS_BORDERS } from '../constants';

interface MyTasksViewProps {
  tasks: Task[];
  members: Member[];
  currentUser: Member;
  onSelectTask: (taskId: string) => void;
  onAddTaskClick: () => void;
}

const MyTasksView: React.FC<MyTasksViewProps> = ({ tasks, members, currentUser, onSelectTask, onAddTaskClick }) => {
  const myTasks = tasks.filter(task => task.assignedToId === currentUser.id && task.status !== Status.Done);
  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">My Tasks</h1>
        <button
          onClick={onAddTaskClick}
          className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>
      
      {myTasks.length > 0 ? (
        <div className="space-y-4">
          {myTasks.map(task => {
            const assignedTo = getMember(task.assignedToId);
            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow border-l-4 ${STATUS_BORDERS[task.status]}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{task.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-slate-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  {assignedTo && (
                    <div className="flex items-center space-x-2">
                      <img src={assignedTo.avatarUrl} alt={assignedTo.name} className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-slate-600">{assignedTo.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-slate-700">No active tasks!</h2>
          <p className="text-slate-500 mt-2">You're all caught up. Enjoy your day!</p>
        </div>
      )}
    </div>
  );
};

export default MyTasksView;
