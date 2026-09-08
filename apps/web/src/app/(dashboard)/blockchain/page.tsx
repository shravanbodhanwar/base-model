'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Link2, Cpu, CheckCircle2, XCircle, Search, RefreshCw, Layers } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function BlockchainExplorerPage() {
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: status, refetch: refetchStatus, isFetching: statusLoading } = useQuery({
    queryKey: ['blockchain-status'],
    queryFn: async () => {
      const res = await apiClient.blockchain.getBlockchainStatus();
      return res?.data || res;
    },
    refetchInterval: 15000
  });

  const { data: contracts } = useQuery({
    queryKey: ['blockchain-contracts'],
    queryFn: async () => {
      const res = await apiClient.blockchain.getContractAddresses();
      return res?.data || res || {};
    }
  });

  const { data: txs = [], isLoading: txsLoading, refetch: refetchTxs } = useQuery({
    queryKey: ['blockchain-transactions'],
    queryFn: async () => {
      const res = await apiClient.blockchain.getTransactions();
      return res?.data || res || [];
    }
  });

  const isConnected = status?.connected ?? false;

  const filteredTxs = txs.filter((t: any) =>
    t.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.contract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.eventName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-emerald-400" />
            <span>Internal Blockchain Activity Explorer</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Permissioned Hyperledger Besu / Hardhat ledger state, smart contract events, and tamper-evident anchors
          </p>
        </div>

        <button
          type="button"
          onClick={() => { refetchStatus(); refetchTxs(); }}
          className="py-2 px-3 bg-[#1A2744] hover:bg-[#1E3A5F] text-slate-200 border border-[#1E3A5F] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger State</span>
        </button>
      </div>

      {/* Network Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Ledger Node Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-sm font-bold text-slate-200">
              {isConnected ? 'NODE ONLINE' : 'SIMULATION MODE'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block truncate">RPC: {status?.rpcUrl || 'http://localhost:8545'}</span>
        </div>

        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Target Architecture</span>
          <div className="text-sm font-bold text-slate-200">Hyperledger Besu (IBFT 2.0)</div>
          <span className="text-[11px] text-slate-500 block">Permissioned Consortium</span>
        </div>

        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Chain ID / Network</span>
          <div className="text-sm font-mono font-bold text-emerald-400">
            {status?.chainId ? `Chain ID: ${status.chainId}` : '31337 (Local Hardhat)'}
          </div>
          <span className="text-[11px] text-slate-500 block">Latest Block: #{status?.blockNumber || 1}</span>
        </div>

        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Anchored Events</span>
          <div className="text-sm font-bold text-slate-200">{txs.length} Confirmed TXs</div>
          <span className="text-[11px] text-slate-500 block">Immutable Audit Records</span>
        </div>
      </div>

      {/* Smart Contract Addresses */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1E3A5F]">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Deployed Smart Contract Suite (OpenZeppelin v5)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {Object.entries(contracts || {}).map(([name, addr]: [string, any]) => (
            <div key={name} className="p-3 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
              <span className="text-slate-400 font-semibold">{name}</span>
              <div className="font-mono text-[11px] text-cyan-400 truncate">
                {addr || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Explorer */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">On-Chain Transaction Log</h3>
          </div>

          <div className="flex items-center gap-2 bg-[#1A2744] border border-[#1E3A5F] px-3 py-1.5 rounded-lg w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by TX hash, event, or contract..."
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none flex-1 placeholder-slate-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A2744] text-slate-400 border-b border-[#1E3A5F]">
              <tr>
                <th className="py-3 px-4 font-semibold">Transaction Hash</th>
                <th className="py-3 px-4 font-semibold">Contract</th>
                <th className="py-3 px-4 font-semibold">Emitted Event</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60 text-slate-300">
              {txsLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading ledger records...</td></tr>
              ) : filteredTxs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">No transactions recorded. Actions like minting assets or creating proposals will anchor transactions here.</td></tr>
              ) : (
                filteredTxs.map((t: any) => (
                  <tr
                    key={t.id || t.txHash}
                    onClick={() => setSelectedTx(t)}
                    className="hover:bg-[#1A2744]/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <HashDisplay hash={t.txHash} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{t.contract || 'IdentityRegistry'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                        {t.eventName || 'AnchorEvent'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status || 'CONFIRMED'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Transaction Details</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Hash:</span>
                <span className="font-mono text-cyan-400 break-all">{selectedTx.txHash}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-500 block">Contract:</span>
                  <span className="text-slate-200">{selectedTx.contract}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Event:</span>
                  <span className="text-emerald-400 font-mono">{selectedTx.eventName}</span>
                </div>
              </div>
              {selectedTx.eventData && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Decoded Event Payload:</span>
                  <pre className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F] text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedTx.eventData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="py-2 px-5 bg-[#1A2744] hover:bg-[#1E3A5F] text-slate-200 rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
