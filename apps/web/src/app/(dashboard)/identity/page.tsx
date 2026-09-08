"use client";
import React from 'react';
import { Users, Building2, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function IdentityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Identity Management</h1>
        <p className="text-slate-400 mt-1">Manage DIDs, users, and organizational wallets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/identity/users" className="block group">
          <Card className="h-full hover:border-accent-blue transition-colors bg-enterprise-surface/50 hover:bg-enterprise-surface cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <span>Users Directory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">
                Manage employee and vendor accounts, view profiles, and manage role assignments.
              </p>
              <div className="mt-4 flex -space-x-2">
                {/* Mock avatars */}
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-enterprise-surface2 border-2 border-enterprise-surface flex items-center justify-center text-xs text-white">
                    U{i}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="/identity/dids" className="block group">
          <Card className="h-full hover:border-accent-cyan transition-colors bg-enterprise-surface/50 hover:bg-enterprise-surface cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan group-hover:bg-accent-cyan group-hover:text-white transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <span>DID Registry</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">
                View all Decentralized Identifiers registered on the BEL blockchain network.
              </p>
              <div className="mt-4 text-2xl font-bold text-white">1,248 Active DIDs</div>
            </CardContent>
          </Card>
        </a>

        <a href="/organizations" className="block group">
          <Card className="h-full hover:border-purple-500 transition-colors bg-enterprise-surface/50 hover:bg-enterprise-surface cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <span>Organizations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">
                Manage organizational units, SBUs, and hierarchy.
              </p>
              <div className="mt-4 text-slate-300 text-sm font-medium">12 Units • 48 SBUs</div>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}
