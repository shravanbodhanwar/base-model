"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Users Directory</h1>
        <p className="text-slate-400 mt-1">Manage employee and vendor identities</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          <p>User directory content goes here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
