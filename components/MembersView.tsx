
import React from 'react';
import { Member, Role } from '../types';
import { PlusIcon, TrashIcon, PencilIcon } from './icons';

interface MembersViewProps {
  members: Member[];
  currentUser: Member;
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
  onEditMember: (memberId: string) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ members, currentUser, onAddMember, onRemoveMember, onEditMember }) => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Members</h1>
        {currentUser.role === Role.Owner && (
          <button
            onClick={onAddMember}
            className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Member</span>
          </button>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-slate-200">
          {members.map(member => (
            <li key={member.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-semibold text-slate-800">{member.name} {member.id === currentUser.id && '(You)'}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded-full">{member.role}</span>
                {currentUser.role === Role.Owner && (
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onEditMember(member.id)} className="text-slate-500 hover:text-brand-primary">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    {member.id !== currentUser.id && (
                        <button onClick={() => onRemoveMember(member.id)} className="text-slate-500 hover:text-red-600">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MembersView;
