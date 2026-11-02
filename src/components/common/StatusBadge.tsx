import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-500';

  if (['HEALTHY', 'SUCCEEDED', 'CONNECTED', 'RESOLVED', 'RUNNING', 'AVAILABLE'].includes(norm)) {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dot = 'bg-emerald-600';
  } else if (['WARNING', 'MEDIUM', 'HIGH', 'INPROGRESS', 'IN_PROGRESS', 'QUEUED'].includes(norm)) {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    dot = 'bg-amber-500';
  } else if (['CRITICAL', 'FAILED', 'ERROR'].includes(norm)) {
    bg = 'bg-rose-50 text-rose-800 border-rose-200';
    dot = 'bg-rose-600 animate-pulse';
  } else if (['NOT_CONFIGURED', 'STOPPED', 'CANCELLED', 'UNKNOWN'].includes(norm)) {
    bg = 'bg-slate-100 text-slate-600 border-slate-300';
    dot = 'bg-slate-400';
  } else if (['OPEN'].includes(norm)) {
    bg = 'bg-blue-50 text-blue-800 border-blue-200';
    dot = 'bg-blue-600';
  } else if (['ACKNOWLEDGED'].includes(norm)) {
    bg = 'bg-purple-50 text-purple-800 border-purple-200';
    dot = 'bg-purple-600';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${bg} font-mono`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};
