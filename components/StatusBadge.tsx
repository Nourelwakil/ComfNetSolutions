
import React from 'react';
import { Status } from '../types';
import { STATUS_COLORS } from '../constants';

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-400 text-white';
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
