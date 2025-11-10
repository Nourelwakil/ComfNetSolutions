import React, { useState, useMemo } from 'react';
import { Member, Role } from '../types';
import { PencilIcon, PlusIcon, TrashIcon } from './icons';

interface MembersViewProps {
  members: Member[];
  currentUser: Member;
  onEditMember: (memberId: string) => void;
  onAddMemberClick: () => void;
  onRemoveMember: (memberId: string) => void;
  onRestoreMember: (memberId: string) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ members, currentUser, onEditMember, onAddMemberClick, onRemoveMember, onRestoreMember }) => {

  const activeMembers = useMemo(() => {
    return members.filter(member => !member.isDeleted);
  }, [members]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Members</h1>
        <div className="flex items-center space-x-4">
          {currentUser.role === Role.Owner && (
            <button
            onClick={onAddMemberClick}
            className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="p-4 text-lg font-semibold text-slate-700 border-b">Active Members ({activeMembers.length})</h2>
        <ul className="divide-y divide-slate-200">
          {activeMembers.map(member => (
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
                    <button onClick={() => onEditMember(member.id)} className="text-slate-500 hover:text-brand-primary" title="Edit Member">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    {member.id !== currentUser.id && (
                       <button onClick={() => onRemoveMember(member.id)} className="text-slate-500 hover:text-red-600" title="Remove Member">
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