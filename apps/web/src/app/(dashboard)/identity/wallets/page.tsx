'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Shield, Key, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function WalletsPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-with-wallets'],
    queryFn: async () => {
      const res = await apiClient.users.getUsers();
      return res?.data || res || [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Wallet className="w-6 h-6 text-cyan-400" />
          <span>Enterprise Wallets & Key Custody</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographic signing accounts: Simulated Hardware Security Modules (HSM) and device key management
        </p>
      </div>

      <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4 flex gap-3 text-xs text-blue-300">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-200">Defence Key Isolation Policy:</strong>
          <p className="text-slate-400 mt-0.5">
            BEL Enterprise architecture enforces independent wallet custody. Private keys are never exported or stored on the shared database.
            In this prototype, accounts simulate secure hardware enclaves with deterministic addressing.
          </p>
        </div>
      </div>

      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A2744] text-slate-400 border-b border-[#1E3A5F]">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Employee ID</th>
                <th className="py-3 px-4 font-semibold">Role Scope</th>
                <th className="py-3 px-4 font-semibold">Wallet Type</th>
                <th className="py-3 px-4 font-semibold">Public Address</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">Loading wallet records...</td>
                </tr>
              ) : (
                users.map((u: any) => {
                  const roleName = u.roleAssignments?.[0]?.role?.name || 'USER';
                  const simulatedAddress = `0x71C...${u.id.substring(0, 6)}4D2F`;
                  return (
                    <tr key={u.id} className="hover:bg-[#1A2744]/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {u.name}
                        <span className="block text-[10px] text-slate-500">{u.email}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {u.employeeId || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/40 text-blue-300 border border-blue-900/50">
                          {roleName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          SIMULATED_HSM
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                        {simulatedAddress}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
