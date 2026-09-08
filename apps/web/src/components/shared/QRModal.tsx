'use client';
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  entityId: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, title, url, entityId }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Verification URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2744] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">Scan to publicly verify without logging in</p>
        </div>

        <div className="flex justify-center p-4 bg-white rounded-xl shadow-inner mx-auto w-fit">
          <QRCodeSVG value={url} size={190} level="H" includeMargin={false} />
        </div>

        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-[#1A2744] border border-[#1E3A5F] flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-slate-300 truncate">{url}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Verification Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
