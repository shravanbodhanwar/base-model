'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, User, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../lib/api';

export function TopBar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [bcStatus, setBcStatus] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await apiClient.blockchain.getBlockchainStatus();
        setBcStatus(status.connected ?? true);
      } catch (e) {
        setBcStatus(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const pathParts = pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1)
    : 'Dashboard';

  return (
    <div className="h-16 border-b border-[#1E3A5F] bg-[#0D1B2A]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-200 capitalize">{title.replace(/-/g, ' ')}</h1>
        <span className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
          DEMO
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${bcStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-slate-400">Network {bcStatus ? 'Connected' : 'Offline'}</span>
        </div>

        <button className="text-slate-400 hover:text-slate-200 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-4 border-l border-[#1E3A5F] pl-6">
          <button onClick={() => logout()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
