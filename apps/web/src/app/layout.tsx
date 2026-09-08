import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'BEL-EDIDAP | Enterprise Identity & Digital Asset Platform',
  description: 'PROTOTYPE - BEL Enterprise Decentralized Identity & Digital Asset Platform. Not real BEL internal software.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="grid-bg min-h-screen">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#0D1B2A', color: '#F1F5F9', border: '1px solid #1E3A5F' },
              success: { iconTheme: { primary: '#4ADE80', secondary: '#0D1B2A' } },
              error: { iconTheme: { primary: '#F87171', secondary: '#0D1B2A' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
