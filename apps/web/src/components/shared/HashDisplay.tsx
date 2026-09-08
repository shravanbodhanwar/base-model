'use client';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function HashDisplay({ hash, className }: { hash: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const displayHash = hash.length > 20 
    ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` 
    : hash;

  const onCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-mono text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
        {displayHash}
      </span>
      <button 
        onClick={onCopy}
        className="text-slate-500 hover:text-slate-300 transition-colors"
        title="Copy full hash"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
