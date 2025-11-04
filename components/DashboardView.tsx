
import React from 'react';
import { Task, Team, Member, Status } from '../types';
import ProgressBar from './ProgressBar';
import { STATUS_COLORS } from '../constants';

interface DashboardViewProps {
  tasks: Task[];
  teams: Team[];
  members: Member[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, teams, members }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === Status.Done).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Total Tasks</h2>
          <p className="text-4xl font-bold text-slate-900">{totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Completed Tasks</h2>
          <p className="text-4xl font-bold text-green-500">{completedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Overall Progress</h2>
          <ProgressBar progress={progress} />
          <p className="text-right text-sm text-slate-500 mt-2">{progress.toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Task Status Overview</h2>
        <div className="flex justify-around">
          {Object.values(Status).map(status => (
            <div key={status} className="text-center">
              <p className={`text-3xl font-bold ${status === Status.ToDo ? 'text-status-todo' : status === Status.InProgress ? 'text-status-inprogress' : status === Status.Blocked ? 'text-status-blocked' : 'text-status-done'}`}>{tasksByStatus[status] || 0}</p>
              <p className="text-sm text-slate-500">{status}</p>
            </div>
          ))}
        </div>
      </div>
      
      {teams.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Teams</h2>
            {/* Team details would go here if there were any teams */}
            <p className="text-slate-500">Team functionality is not fully implemented in this view.</p>
        </div>
      )}
      {teams.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-4">No Teams Yet</h2>
            <p className="text-slate-500">Create a team to start collaborating.</p>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
