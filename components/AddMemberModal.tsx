import React, { useState } from 'react';
import { XCircleIcon } from './icons';

interface AddMemberModalProps {
  onClose: () => void;
  onAddMember: (name: string, email: string, password: string) => Promise<{success: boolean, error?: string}>;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && password.trim()) {
      setLoading(true);
      setError('');
      const result = await onAddMember(name, email, password);
      if (result.success) {
        onClose();
      } else {
        setLoading(false);
        setError(result.error || 'Failed to add member.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold text-slate-800">Add New Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white text-slate-900"
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
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white text-slate-900"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white text-slate-900"
                required
                minLength={6}
              />
              <p className="text-xs text-slate-500 mt-1">The new member will use this password to log in. Must be at least 6 characters.</p>
            </div>
             {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-brand-primary-dark" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;