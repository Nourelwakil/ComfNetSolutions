
import React from 'react';
import { Task, Member, Status } from '../types';
import { CheckCircleIcon } from './icons';

interface CompletedTasksViewProps {
  tasks: Task[];
  members: Member[];
  onSelectTask: (taskId: string) => void;
}

const CompletedTasksView: React.FC<CompletedTasksViewProps> = ({ tasks, members, onSelectTask }) => {
  const completedTasks = tasks.filter(task => task.status === Status.Done);
  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Completed Tasks</h1>
      
      {completedTasks.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-slate-200">
            {completedTasks.map(task => {
              const assignedTo = getMember(task.assignedToId);
              const completedBy = task.completedById ? getMember(task.completedById) : null;
              
              return (
                <li
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className="p-4 cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 truncate">{task.title}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                        <span>Assigned to: {assignedTo?.name || 'N/A'}</span>
                        {completedBy && task.completedAt && (
                          <span>Completed by: {completedBy.name} on {new Date(task.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-green-500">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Done</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-slate-700">No completed tasks yet.</h2>
          <p className="text-slate-500 mt-2">Get to work and complete some tasks!</p>
        </div>
      )}
    </div>
  );
};

export default CompletedTasksView;
