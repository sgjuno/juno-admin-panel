'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Database, Users, FileText, MessageCircle, Settings, ListChecks, FolderKanban, GitBranch } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const collections = [
  { name: 'ai-core-agent-plans-config', path: '/ai-core-agent-plans-config', icon: Settings },
  { name: 'ai-core-tools-config', path: '/ai-core-tools-config', icon: FolderKanban },
  { name: 'clients', path: '/clients', icon: Users },
  { name: 'communicationRecords', path: '/communicationRecords', icon: MessageCircle },
  { name: 'customerDatapointsHistory', path: '/customerDatapointsHistory', icon: ListChecks },
  { name: 'junoDatapoints', path: '/junoDatapoints', icon: Database },
  { name: 'leads', path: '/leads', icon: FileText },
  { name: 'questionStatus', path: '/questionStatus', icon: Book },
];

const clientConfigItems = [
  { name: 'Required Details', path: '/clients/[clientId]/required-details', icon: FileText },
  { name: 'Flow Visualizer', path: '/clients/[clientId]/required-details-visualizer', icon: GitBranch },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isClientConfig = /^\/clients\/[^/]+\//.test(pathname);

  return (
    <aside className="h-screen border-r bg-sidebar flex flex-col">
      <div className="p-6">
        <Card className="border-sidebar-border">
          <CardHeader className="p-4">
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Collections
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {collections.map((col) => {
            const Icon = col.icon;
            const isActive = pathname.startsWith(col.path);
            return (
              <li key={col.path}>
                <Link
                  href={col.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {col.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {isClientConfig && (
          <>
            <div className="mt-6 mb-2 px-3">
              <h3 className="text-sm font-semibold text-sidebar-foreground">Client Configuration</h3>
            </div>
            <ul className="space-y-1">
              {clientConfigItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.includes(item.path.replace('[clientId]', pathname.split('/')[2]));
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path.replace('[clientId]', pathname.split('/')[2])}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>
    </aside>
  );
} 