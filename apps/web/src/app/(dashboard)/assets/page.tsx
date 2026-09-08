"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Box, Laptop, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AssetsPage() {
  const mockAssets = [
    { id: 'AST-1001', name: 'L7 ThinkPad X1', category: 'Equipment', owner: 'did:bel:emp-101', status: 'IN_USE', timestamp: '2023-11-01' },
    { id: 'AST-1002', name: 'Server Rack C4', category: 'Infrastructure', owner: 'did:bel:unit-bng', status: 'ACTIVE', timestamp: '2022-08-15' },
    { id: 'AST-1003', name: 'Security Clearance L3', category: 'Badge', owner: 'did:bel:emp-404', status: 'REVOKED', timestamp: '2023-01-22' },
    { id: 'AST-1004', name: 'R&D Lab Access', category: 'Token', owner: 'did:bel:emp-205', status: 'ACTIVE', timestamp: '2024-02-10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Digital Assets Registry</h1>
          <p className="text-slate-400 mt-1">Manage physical and digital assets tracked on-chain</p>
        </div>
        <Link href="/assets/mint">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Mint Asset</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b border-enterprise-surface2 pb-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search assets by ID, name, or owner..." 
                className="w-full bg-enterprise-bg border border-enterprise-surface2 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-enterprise-surface2 uppercase border-b border-enterprise-surface2">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Owner/Custodian</th>
                  <th className="px-6 py-4 font-medium">Minted Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-enterprise-surface2">
                {mockAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-enterprise-surface2/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-300">{asset.id}</td>
                    <td className="px-6 py-4 text-white font-medium">{asset.name}</td>
                    <td className="px-6 py-4 text-slate-300 flex items-center space-x-2">
                      {asset.category === 'Equipment' && <Laptop className="w-4 h-4 text-slate-400" />}
                      {asset.category === 'Badge' && <Shield className="w-4 h-4 text-status-active" />}
                      {asset.category !== 'Equipment' && asset.category !== 'Badge' && <Box className="w-4 h-4 text-accent-cyan" />}
                      <span>{asset.category}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{asset.owner}</td>
                    <td className="px-6 py-4 text-slate-400">{asset.timestamp}</td>
                    <td className="px-6 py-4">
                      <Badge variant={asset.status === 'REVOKED' ? 'destructive' : 'success'}>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
