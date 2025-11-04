
import React from 'react';
import { Team, Member, Task } from '../types';

interface TeamDetailViewProps {
  team: Team;
  allMembers: Member[];
  allTasks: Task[];
}

const TeamDetailView: React.FC<TeamDetailViewProps> = ({ team, allMembers, allTasks }) => {
  const teamMembers = allMembers.filter(member => team.memberIds.some(m => m.id === member.id));
  const teamTasks = allTasks.filter(task => task.teamId === team.id);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{team.name}</h1>
      <p className="text-slate-600 mb-6">{team.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Members</h2>
          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center space-x-3">
                <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-slate-700">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Tasks</h2>
          <div className="bg-white p-4 rounded-lg shadow space-y-2">
            {teamTasks.length > 0 ? (
              teamTasks.map(task => (
                <div key={task.id} className="border-b border-slate-200 pb-2 last:border-b-0">
                  <p className="font-semibold text-slate-700">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.status} - Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No tasks for this team yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailView;
