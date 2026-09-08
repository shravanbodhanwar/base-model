"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 mt-1">Configure platform parameters and blockchain nodes</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          <p>Settings panel goes here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
