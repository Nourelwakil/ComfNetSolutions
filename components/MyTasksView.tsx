

import React from 'react';
import { Task, Member, Status, Role } from '../types';
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
  const activeTasks = tasks.filter(task => task.status !== Status.Done);
  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">All Active Tasks</h1>
        {currentUser.role === Role.Owner && (
            <button
            onClick={onAddTaskClick}
            className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark transition-colors"
            >
            <PlusIcon className="w-5 h-5" />
            <span>Add Task</span>
            </button>
        )}
      </div>
      
      {activeTasks.length > 0 ? (
        <div className="space-y-4">
          {activeTasks.map(task => {
            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow border-l-4 ${STATUS_BORDERS[task.status]}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{task.title}</h3>
                    <div className="text-sm text-slate-500 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: task.description }}></div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-slate-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  {task.assignedToIds.length > 0 && (
                    <div className="flex items-center">
                        {task.assignedToIds.slice(0, 3).map((id, index) => {
                            const member = getMember(id);
                            return member ? <img key={id} src={member.avatarUrl} title={member.name} alt={member.name} className={`w-8 h-8 rounded-full border-2 border-white ${index > 0 ? '-ml-3' : ''} ${member.isDeleted ? 'opacity-50' : ''}`} /> : null;
                        })}
                        {task.assignedToIds.length > 3 && (
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-xs font-semibold text-slate-600 border-2 border-white -ml-3">+{task.assignedToIds.length - 3}</span>
                        )}
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
          <p className="text-slate-500 mt-2">Create a new task to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MyTasksView;