import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Calendar, Hash, QrCode } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { HashDisplay } from './HashDisplay';

interface CredentialCardProps {
  credential: {
    id: string;
    credentialId: string;
    type: string;
    issuerDID: string;
    subjectDID: string;
    issuedAt: string | Date;
    expiresAt?: string | Date | null;
    status: string;
    blockchainTxHash?: string | null;
    claims?: any;
    issuer?: { name?: string };
    subject?: { name?: string };
  };
  onShowQR?: (credential: any) => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({ credential, onShowQR }) => {
  return (
    <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5 hover:border-blue-500/50 transition-all shadow-lg flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                {credential.type}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                {credential.credentialId}
              </p>
            </div>
          </div>
          <StatusBadge status={credential.status} />
        </div>

        <div className="space-y-2 text-xs text-slate-400 my-4 border-y border-[#1E3A5F]/60 py-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Subject:</span>
            <span className="font-mono text-slate-300 truncate max-w-[180px]">
              {credential.subject?.name || credential.subjectDID}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Issuer:</span>
            <span className="font-mono text-slate-300 truncate max-w-[180px]">
              {credential.issuer?.name || credential.issuerDID}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Issued:</span>
            <span className="text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(credential.issuedAt).toLocaleDateString()}
            </span>
          </div>
          {credential.blockchainTxHash && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Anchor:</span>
              <HashDisplay hash={credential.blockchainTxHash} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Link
          href={`/credentials/${credential.id}`}
          className="flex-1 py-1.5 px-3 bg-[#1A2744] hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 text-xs font-medium rounded-lg text-center border border-[#1E3A5F] hover:border-blue-500/40 transition-all"
        >
          View Details
        </Link>
        {onShowQR && (
          <button
            type="button"
            onClick={() => onShowQR(credential)}
            className="p-1.5 bg-[#1A2744] hover:bg-slate-700 text-slate-300 rounded-lg border border-[#1E3A5F] transition-all"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
