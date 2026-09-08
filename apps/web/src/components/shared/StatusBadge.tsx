import * as React from 'react';
import { cn } from '../../lib/utils';

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const getStatusConfig = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'VALID':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'REVOKED':
      case 'INVALID':
      case 'BURNED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'EXPIRED':
      case 'SUSPENDED':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'PENDING':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider', getStatusConfig(), className)}>
      {status}
    </span>
  );
}
