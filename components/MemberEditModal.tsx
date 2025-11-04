import React, { useState } from 'react';
import { Member, Role } from '../types';
import { XCircleIcon } from './icons';
import { AVATARS } from '../constants';

interface MemberEditModalProps {
  member: Member;
  onClose: () => void;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
}

const MemberEditModal: React.FC<MemberEditModalProps> = ({ member, onClose, onUpdateMember }) => {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState(member.role);
  const [avatarUrl, setAvatarUrl] = useState(member.avatarUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMember(member.id, { name, email, role, avatarUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold text-slate-800">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center">
                <img src={avatarUrl} alt={name} className="w-24 h-24 rounded-full mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Change Avatar</h3>
                 <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                    {AVATARS.map((avatar, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setAvatarUrl(avatar)}
                            className={`w-12 h-12 rounded-full border-2 overflow-hidden ${avatar === avatarUrl ? 'ring-2 ring-offset-2 ring-brand-primary' : ''}`}
                        >
                            <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
              <select 
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-black disabled:bg-slate-100"
                disabled // For now, let's disable role change as it might have wider implications not handled.
              >
                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
               <p className="text-xs text-slate-500 mt-1">Role changes are disabled in this view.</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-brand-primary-dark">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberEditModal;