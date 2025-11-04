import React from 'react';
import { HomeIcon, ListIcon, UsersIcon, LogOutIcon, CheckCircleIcon } from './icons';
import { Member, Role } from '../types';

type View = 'dashboard' | 'members' | 'my-tasks' | 'completed-tasks';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  onProfileClick: () => void;
  currentUser: Member;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-brand-primary text-white'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onLogout, onProfileClick, currentUser }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-slate-800">ComfNet Solutions Progress Bar</span>
          </div>
          <div className="flex items-center space-x-2">
            <nav className="flex items-center space-x-2">
              <NavItem 
                  icon={<HomeIcon className="w-5 h-5" />} 
                  label="Dashboard" 
                  isActive={activeView === 'dashboard'}
                  onClick={() => setActiveView('dashboard')}
              />
              <NavItem 
                  icon={<ListIcon className="w-5 h-5" />} 
                  label="My Tasks" 
                  isActive={activeView === 'my-tasks'}
                  onClick={() => setActiveView('my-tasks')}
              />
              <NavItem 
                  icon={<CheckCircleIcon className="w-5 h-5" />} 
                  label="Completed" 
                  isActive={activeView === 'completed-tasks'}
                  onClick={() => setActiveView('completed-tasks')}
              />
              {currentUser.role === Role.Owner && (
                <NavItem 
                    icon={<UsersIcon className="w-5 h-5" />} 
                    label="Members" 
                    isActive={activeView === 'members'}
                    onClick={() => setActiveView('members')}
                />
              )}
            </nav>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button
              onClick={onProfileClick}
              className="p-1 rounded-full hover:bg-slate-200 transition-colors"
              title="Edit Profile"
            >
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              title="Logout"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;