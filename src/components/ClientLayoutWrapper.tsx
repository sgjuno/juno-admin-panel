"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !pathname?.startsWith('/clients/') || pathname === '/clients';

  return (
    <div className="flex h-screen">
      {showSidebar && (
        <aside className="w-64 flex-shrink-0 h-screen overflow-y-auto bg-sidebar border-r">
          <Sidebar />
        </aside>
      )}
      <main className="flex-1 h-screen overflow-y-auto bg-background">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 