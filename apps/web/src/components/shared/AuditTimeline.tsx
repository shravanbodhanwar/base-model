import React from 'react';
import { Activity, Key, Award, ShieldAlert, Package, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { HashDisplay } from './HashDisplay';

interface AuditEvent {
  id: string;
  eventType: string;
  action: string;
  actorId?: string | null;
  actorRole?: string | null;
  targetId?: string | null;
  targetType?: string | null;
  timestamp: string | Date;
  txHash?: string | null;
  status: string;
}

interface AuditTimelineProps {
  events: AuditEvent[];
  maxItems?: number;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'CREDENTIAL_ISSUED':
      return <Award className="w-4 h-4 text-blue-400" />;
    case 'DID_ROTATED':
    case 'DID_CREATED':
      return <Key className="w-4 h-4 text-emerald-400" />;
    case 'ASSET_TRANSFER':
      return <Package className="w-4 h-4 text-cyan-400" />;
    case 'AUTH':
      return <UserCheck className="w-4 h-4 text-indigo-400" />;
    case 'DATA_ACCESS':
      return <Shield className="w-4 h-4 text-amber-400" />;
    default:
      return <Activity className="w-4 h-4 text-slate-400" />;
  }
};

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events, maxItems }) => {
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-500">
        No audit events recorded in this scope.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E3A5F]">
      {displayEvents.map((evt) => (
        <div key={evt.id} className="relative group">
          <div className="absolute -left-6 top-1 p-1 rounded-full bg-[#0D1B2A] border border-[#1E3A5F] group-hover:border-blue-500/50 transition-colors">
            {getEventIcon(evt.eventType)}
          </div>

          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg p-3 hover:border-slate-600 transition-all">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-200">
                {evt.action}
              </span>
              <StatusBadge status={evt.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
              <span>Type: <strong className="text-slate-300">{evt.eventType}</strong></span>
              {evt.actorRole && <span>Role: <strong className="text-slate-300">{evt.actorRole}</strong></span>}
              <span>{new Date(evt.timestamp).toLocaleString()}</span>
            </div>

            {evt.txHash && (
              <div className="mt-2 pt-2 border-t border-[#1E3A5F]/50 flex items-center gap-2 text-[11px] text-slate-500">
                <span>Ledger Anchor:</span>
                <HashDisplay hash={evt.txHash} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
