"use client";
import React from 'react';
import { Copy, QrCode, Key, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface DIDCardProps {
  did: string;
  status: string;
  publicKey: string;
  entityName?: string;
  createdAt?: string | Date;
  onRotate?: () => void;
  onShowQR?: () => void;
}

export function DIDCard({ did, status, publicKey, entityName = 'Subject DID', createdAt, onRotate, onShowQR }: DIDCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const isActive = status === 'ACTIVE';

  return (
    <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Shield className="w-32 h-32" />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-white">{entityName}</h3>
            <p className="text-slate-400 text-xs mt-0.5">W3C Decentralized Identifier</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${isActive ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'}`}>
            {status}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">DID URI</label>
            <div className="flex items-center space-x-2 mt-1 bg-[#1A2744] p-2 rounded-lg border border-[#1E3A5F]">
              <code className="text-cyan-400 font-mono text-xs flex-1 truncate">{did}</code>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-white"
                onClick={() => copyToClipboard(did)}
                title="Copy DID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Public Key Multibase</label>
            <div className="flex items-center space-x-2 mt-1 bg-[#1A2744] p-2 rounded-lg border border-[#1E3A5F]">
              <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <code className="text-slate-300 font-mono text-[11px] flex-1 truncate">{publicKey}</code>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-white"
                onClick={() => copyToClipboard(publicKey)}
                title="Copy Key"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#1E3A5F]/60 flex gap-2">
          {onRotate && (
            <button
              type="button"
              onClick={onRotate}
              className="flex-1 py-1.5 px-3 rounded-lg bg-[#1A2744] hover:bg-blue-900/30 text-blue-300 border border-[#1E3A5F] text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotate Key</span>
            </button>
          )}
          {onShowQR && (
            <button
              type="button"
              onClick={onShowQR}
              className="py-1.5 px-3 rounded-lg bg-[#1A2744] hover:bg-slate-700 text-slate-300 border border-[#1E3A5F] text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
