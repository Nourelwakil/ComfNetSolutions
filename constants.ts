import { Status } from './types';

export const STATUS_COLORS: { [key in Status]: string } = {
  [Status.ToDo]: 'bg-status-todo text-white',
  [Status.InProgress]: 'bg-status-inprogress text-white',
  [Status.Blocked]: 'bg-status-blocked text-white',
  [Status.Done]: 'bg-status-done text-white',
};

export const STATUS_BORDERS: { [key in Status]: string } = {
    [Status.ToDo]: 'border-status-todo',
    [Status.InProgress]: 'border-status-inprogress',
    [Status.Blocked]: 'border-status-blocked',
    [Status.Done]: 'border-status-done',
};

export const TASK_COLORS = [
  { name: 'Gray', className: 'border-slate-400', bgClassName: 'bg-slate-400' },
  { name: 'Red', className: 'border-red-500', bgClassName: 'bg-red-500' },
  { name: 'Orange', className: 'border-orange-500', bgClassName: 'bg-orange-500' },
  { name: 'Amber', className: 'border-amber-500', bgClassName: 'bg-amber-500' },
  { name: 'Green', className: 'border-green-500', bgClassName: 'bg-green-500' },
  { name: 'Blue', className: 'border-blue-500', bgClassName: 'bg-blue-500' },
  { name: 'Purple', className: 'border-purple-500', bgClassName: 'bg-purple-500' },
];

export const AVATARS = Array.from({ length: 16 }, (_, i) => `https://picsum.photos/seed/avatar-${i + 1}/200/200`);