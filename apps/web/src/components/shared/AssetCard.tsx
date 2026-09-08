import React from 'react';
import Link from 'next/link';
import { Package, Shield, Cpu, FileCheck, Award, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { HashDisplay } from './HashDisplay';

interface AssetCardProps {
  asset: {
    id: string;
    name: string;
    description?: string | null;
    tokenId?: string | null;
    category: string;
    transferability: string;
    status: string;
    owner?: { name?: string; employeeId?: string | null };
    custodian?: { name?: string };
    unit?: { name?: string };
    sbu?: { name?: string };
    blockchainTxHash?: string | null;
  };
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'HARDWARE':
    case 'EQUIPMENT_CUSTODY':
      return <Cpu className="w-5 h-5 text-cyan-400" />;
    case 'SOFTWARE':
    case 'RD_PROTOTYPE':
      return <Package className="w-5 h-5 text-blue-400" />;
    case 'DOCUMENT':
    case 'DOCUMENT_NOTARIZATION':
      return <FileCheck className="w-5 h-5 text-emerald-400" />;
    case 'ACCESS_BADGE':
    case 'TRAINING_BADGE':
      return <Award className="w-5 h-5 text-amber-400" />;
    default:
      return <Shield className="w-5 h-5 text-slate-400" />;
  }
};

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  return (
    <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5 hover:border-cyan-500/50 transition-all shadow-lg flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1A2744] border border-[#1E3A5F]">
              {getCategoryIcon(asset.category)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                {asset.name}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                {asset.tokenId || asset.id.substring(0, 13)}
              </p>
            </div>
          </div>
          <StatusBadge status={asset.status} />
        </div>

        {asset.description && (
          <p className="text-xs text-slate-400 line-clamp-2 my-2">
            {asset.description}
          </p>
        )}

        <div className="space-y-1.5 text-xs text-slate-400 my-4 border-y border-[#1E3A5F]/60 py-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Category:</span>
            <span className="text-slate-300 font-medium">{asset.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type:</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${asset.transferability === 'SOULBOUND' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50' : 'bg-blue-900/40 text-blue-300 border border-blue-800/50'}`}>
              {asset.transferability}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Custodian:</span>
            <span className="text-slate-300 truncate max-w-[150px]">
              {asset.custodian?.name || asset.owner?.name || 'Unassigned'}
            </span>
          </div>
          {asset.unit && (
            <div className="flex justify-between">
              <span className="text-slate-500">Unit/SBU:</span>
              <span className="text-slate-300 truncate max-w-[150px]">
                {asset.unit.name} {asset.sbu ? `· ${asset.sbu.name}` : ''}
              </span>
            </div>
          )}
          {asset.blockchainTxHash && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Anchor:</span>
              <HashDisplay hash={asset.blockchainTxHash} />
            </div>
          )}
        </div>
      </div>

      <Link
        href={`/assets/${asset.id}`}
        className="w-full py-2 px-3 bg-[#1A2744] hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border border-[#1E3A5F] hover:border-cyan-500/40 transition-all"
      >
        <span>View Asset & Custody</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
