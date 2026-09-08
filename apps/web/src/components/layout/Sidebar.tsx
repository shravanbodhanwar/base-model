'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Users, FileText, Package, Building2, Scale, Activity, Settings, HardHat } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Verify', href: '/verify', icon: Shield },
    ...(hasPermission('VIEW_USERS') ? [{ name: 'Identity', href: '/identity', icon: Users }] : []),
    ...(hasPermission('VIEW_CREDENTIALS') ? [{ name: 'Credentials', href: '/credentials', icon: FileText }] : []),
    ...(hasPermission('VIEW_ASSETS') ? [{ name: 'Assets', href: '/assets', icon: Package }] : []),
    ...(hasPermission('VIEW_ORGANIZATIONS') ? [{ name: 'Organizations', href: '/organizations', icon: Building2 }] : []),
    ...(hasPermission('VIEW_ROLES') ? [{ name: 'Roles', href: '/roles', icon: Users }] : []),
    ...(hasPermission('VIEW_VENDORS') ? [{ name: 'Vendors', href: '/vendors', icon: HardHat }] : []),
    ...(hasPermission('VIEW_GOVERNANCE') ? [{ name: 'Governance', href: '/governance', icon: Scale }] : []),
    ...(hasPermission('VIEW_APPROVALS') ? [{ name: 'Approvals', href: '/approvals', icon: Shield }] : []),
    ...(hasPermission('VIEW_AUDIT') ? [{ name: 'Audit', href: '/audit', icon: Activity }] : []),
    ...(hasPermission('VIEW_AUDIT') ? [{ name: 'Blockchain', href: '/blockchain', icon: Activity }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-[#0D1B2A] h-full border-r border-[#1E3A5F]">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1E3A5F]">
        <Shield className="w-8 h-8 text-blue-500" />
        <div className="flex flex-col">
          <span className="font-bold text-slate-200">BEL-EDIDAP</span>
          <span className="text-[10px] text-amber-500 font-semibold px-1.5 py-0.5 bg-amber-500/10 rounded-sm w-fit mt-1">PROTOTYPE</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[#1E3A5F] bg-amber-900/10">
        <p className="text-[10px] text-amber-400/80 leading-tight">
          ⚠ SIMULATED DEMO DATA<br/>Not for production use
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive 
                  ? 'bg-[#1E3A5F]/50 text-blue-400 border-l-2 border-blue-500' 
                  : 'text-slate-400 hover:bg-[#1E3A5F]/30 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-[#1E3A5F] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-blue-400 font-bold text-sm">
            {user.name?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm text-slate-200 truncate">{user.name}</span>
            <span className="text-xs text-slate-500 truncate">{user.roleAssignments?.[0]?.role?.name || 'User'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
