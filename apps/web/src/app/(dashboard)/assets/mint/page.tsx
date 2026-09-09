'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Shield, ArrowLeft, CheckCircle2, Cpu, FileCheck, Award, Lock } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const ASSET_CATEGORIES = [
  { id: 'EQUIPMENT_CUSTODY', name: 'Equipment & Custody Asset', desc: 'Defence hardware, radar components, test apparatus', defaultSoulbound: false, icon: Cpu },
  { id: 'RD_PROTOTYPE', name: 'R&D Prototype Artifact', desc: 'Proprietary software binary, CAD blueprints, defence models', defaultSoulbound: false, icon: Package },
  { id: 'TRAINING_BADGE', name: 'Training & Skill Badge', desc: 'Non-transferable soulbound achievement certificate', defaultSoulbound: true, icon: Award },
  { id: 'INSPECTION_CERT', name: 'Inspection / QA Token', desc: 'Quality assurance sign-off linked to defence asset', defaultSoulbound: false, icon: FileCheck },
  { id: 'DOCUMENT_NOTARIZATION', name: 'Document Notarization', desc: 'Proof of existence and immutable timestamping record', defaultSoulbound: false, icon: Shield },
];

export default function MintAssetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(ASSET_CATEGORIES[0].id);
  const [isSoulbound, setIsSoulbound] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [metadataText, setMetadataText] = useState(
    JSON.stringify({ serialNumber: 'SN-BEL-2024-001', classification: 'RESTRICTED', location: 'Bangalore Plant Lab 4' }, null, 2)
  );

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.users.getUsers();
      return res?.data || res || [];
    }
  });

  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    const cat = ASSET_CATEGORIES.find(c => c.id === catId);
    if (cat) {
      setIsSoulbound(cat.defaultSoulbound);
    }
  };

  const mintMutation = useMutation({
    mutationFn: async (payload: any) => apiClient.assets.mintAsset(payload),
    onSuccess: (data: any) => {
      toast.success('Digital asset minted to ledger');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      router.push(`/assets/${data?.data?.id || data?.id || ''}`);
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Failed to mint asset'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Asset name is required');
      return;
    }

    let parsedMeta = {};
    try {
      parsedMeta = JSON.parse(metadataText);
    } catch {
      toast.error('Metadata must be valid JSON');
      return;
    }

    mintMutation.mutate({
      name,
      description,
      category,
      transferability: isSoulbound ? 'SOULBOUND' : 'TRANSFERABLE',
      ownerId: selectedOwnerId || undefined,
      requiresApproval,
      metadataJson: parsedMeta
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/assets"
          className="p-2 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-400" />
            <span>Mint Enterprise Asset / Custody NFT</span>
          </h1>
          <p className="text-sm text-slate-400">
            ERC-721 tokenization & ERC-5192 Soulbound ledger registration with off-chain defence metadata
          </p>
        </div>
      </div>

      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-8 shadow-2xl space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              1. Asset Category
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ASSET_CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleCategoryChange(c.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${category === c.id ? 'bg-cyan-600/10 border-cyan-500 ring-1 ring-cyan-500/40' : 'bg-[#1A2744]/40 border-[#1E3A5F] hover:border-slate-600'}`}
                  >
                    <div className="p-2 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-200">{c.name}</h4>
                        {category === c.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Asset Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Tactical S-Band Radar Transceiver Unit"
                className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Initial Custodian / Holder
              </label>
              <select
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Current User (Caller)</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.department || 'BEL'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description / Specifications
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief operational or technical notes for physical/digital tracking..."
              className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Transferability / Soulbound Toggle */}
          <div className="p-4 rounded-xl bg-[#1A2744]/40 border border-[#1E3A5F] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Non-Transferable (Soulbound)</div>
              <div className="text-[11px] text-slate-400">
                If enabled, smart contract reverts any transfer call. Ideal for credentials and training badges.
              </div>
            </div>
            <input
              type="checkbox"
              checked={isSoulbound}
              onChange={(e) => setIsSoulbound(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-[#0D1B2A] border-[#1E3A5F]"
            />
          </div>

          {/* Off-Chain Metadata */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Asset Metadata (Off-Chain JSON)
              </label>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" /> Off-Chain Protected
              </span>
            </div>
            <textarea
              value={metadataText}
              onChange={(e) => setMetadataText(e.target.value)}
              rows={5}
              className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 border-t border-[#1E3A5F] flex items-center justify-end gap-4">
            <Link
              href="/assets"
              className="py-2 px-4 rounded-lg bg-transparent text-slate-400 hover:text-slate-200 text-xs font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mintMutation.isPending}
              className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {mintMutation.isPending ? 'Minting on Ledger...' : 'Mint Digital Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
