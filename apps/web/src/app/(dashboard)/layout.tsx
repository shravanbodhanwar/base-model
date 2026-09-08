import { DashboardLayout as Layout } from '../../components/layout/DashboardLayout';

export default function DashboardRoutesLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
