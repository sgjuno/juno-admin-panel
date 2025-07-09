'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Package,
  Users,
  MessageCircle,
  ListChecks,
  BarChart2,
  FileText,
  CheckCircle,
  GitBranch,
  Menu as MenuIcon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const collections = [
  { name: 'ai-core-agent-plans-config', path: '/ai-core-agent-plans-config', icon: Settings, label: 'Agent Plans Config' },
  { name: 'ai-core-tools-config', path: '/ai-core-tools-config', icon: Package, label: 'Tools Config' },
  { name: 'clients', path: '/clients', icon: Users, label: 'Clients' },
  { name: 'communicationRecords', path: '/communicationRecords', icon: MessageCircle, label: 'Communication' },
  { name: 'customerDatapointsHistory', path: '/customerDatapointsHistory', icon: ListChecks, label: 'Datapoints History' },
  { name: 'junoDatapoints', path: '/junoDatapoints', icon: BarChart2, label: 'Juno Datapoints' },
  { name: 'leads', path: '/leads', icon: FileText, label: 'Leads' },
  { name: 'questionStatus', path: '/questionStatus', icon: CheckCircle, label: 'Question Status' },
];

const clientConfigItems = [
  {
    name: 'Required Details',
    path: '/clients/[clientId]/required-details',
    icon: FileText,
    subTabs: [
      {
        name: 'Data Points Required',
        path: '/clients/[clientId]/data-points-required',
        icon: GitBranch,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isClientConfig = /^\/clients\/[^/]+\//.test(pathname);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [clientConfigOpen, setClientConfigOpen] = useState(isClientConfig);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Breadcrumb logic
  let breadcrumb = null;
  if (isClientConfig) {
    const clientId = pathname.split('/')[2];
    const activeConfig = clientConfigItems.find(item => pathname.includes(item.path.replace('[clientId]', clientId)));
    if (activeConfig) {
      breadcrumb = (
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground font-medium">
          <Users className="w-4 h-4" />
          <span>Clients</span>
          <ChevronRight className="w-4 h-4" />
          <span>{activeConfig.name}</span>
        </div>
      );
    }
  }

  // Responsive: hide sidebar on mobile/tablet unless toggled
  return (
    <>
      {/* Hamburger menu for mobile/tablet */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-md border border-gray-200"
        aria-label="Open sidebar"
        onClick={() => setSidebarOpen(v => !v)}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <aside
        className={cn(
          'h-screen border-r bg-sidebar flex flex-col transition-all duration-200 z-40',
          'fixed md:static top-0 left-0',
          sidebarOpen ? 'w-64' : 'w-16',
          'md:w-72',
          'overflow-y-auto',
        )}
        style={{ minWidth: sidebarOpen ? 220 : 56 }}
      >
        <div className={cn('p-4 md:p-6 flex flex-col gap-4', sidebarOpen ? 'items-start' : 'items-center')}> 
          <Card className="border-sidebar-border w-full">
            <CardHeader className={cn('p-4', sidebarOpen ? '' : 'p-2 flex justify-center')}> 
              <CardTitle className={cn('text-lg font-semibold text-sidebar-foreground', sidebarOpen ? '' : 'sr-only')}>Collections</CardTitle>
              {!sidebarOpen && <BarChart2 className="w-6 h-6 mx-auto" />}
            </CardHeader>
          </Card>
          {breadcrumb && sidebarOpen && (
            <div className="w-full">{breadcrumb}</div>
          )}
        </div>
        <nav className={cn('flex-1 px-1 md:px-3 flex flex-col gap-8', sidebarOpen ? '' : 'items-center')}> 
          {/* Collections group */}
          <div className="w-full">
            <button
              className={cn('flex items-center gap-2 w-full px-3 py-2 rounded-md font-semibold text-sm transition-colors',
                collectionsOpen ? 'bg-muted' : 'hover:bg-muted',
                sidebarOpen ? '' : 'justify-center')}
              onClick={() => setCollectionsOpen(v => !v)}
              aria-expanded={collectionsOpen}
            >
              {collectionsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span className={sidebarOpen ? '' : 'sr-only'}>Collections</span>
            </button>
            {collectionsOpen && (
              <ul className={cn('flex flex-col gap-1 mt-2', sidebarOpen ? '' : 'items-center')}> 
                {collections.map((col) => {
                  const Icon = col.icon;
                  const isActive = pathname.startsWith(col.path);
                  return (
                    <li key={col.path} className="w-full">
                      <Link
                        href={col.path}
                        className={cn(
                          'sidebar-item flex items-center gap-3 rounded-md text-sm transition-colors font-normal border-l-4 border-transparent',
                          'px-[12px] py-2',
                          isActive
                            ? 'bg-[#e2e8f0] font-semibold border-l-4 border-indigo-600 text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-[#f0f4f8] hover:font-medium hover:border-l-4 hover:border-indigo-400',
                          sidebarOpen ? '' : 'justify-center px-0',
                        )}
                        style={{ minHeight: 40 }}
                      >
                        <Icon className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium">{col.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {/* Client Config group */}
          {isClientConfig && (
            <div className="w-full">
              <button
                className={cn('flex items-center gap-2 w-full px-3 py-2 rounded-md font-semibold text-sm transition-colors',
                  clientConfigOpen ? 'bg-muted' : 'hover:bg-muted',
                  sidebarOpen ? '' : 'justify-center')}
                onClick={() => setClientConfigOpen(v => !v)}
                aria-expanded={clientConfigOpen}
              >
                {clientConfigOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className={sidebarOpen ? '' : 'sr-only'}>Client Configuration</span>
              </button>
              {clientConfigOpen && (
                <ul className={cn('flex flex-col gap-1 mt-2', sidebarOpen ? '' : 'items-center')}> 
                  {clientConfigItems.map((item) => {
                    const Icon = item.icon;
                    const clientId = pathname.split('/')[2];
                    const isActive = pathname.includes(item.path.replace('[clientId]', clientId));
                    return (
                      <li key={item.path} className="w-full">
                        <Link
                          href={item.path.replace('[clientId]', clientId)}
                          className={cn(
                            'sidebar-item flex items-center gap-3 rounded-md text-sm transition-colors font-normal border-l-4 border-transparent',
                            'px-[12px] py-2',
                            isActive
                              ? 'bg-[#e2e8f0] font-semibold border-l-4 border-indigo-600 text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-[#f0f4f8] hover:font-medium hover:border-l-4 hover:border-indigo-400',
                            sidebarOpen ? '' : 'justify-center px-0',
                          )}
                          style={{ minHeight: 40 }}
                        >
                          <Icon className="w-5 h-5" />
                          {sidebarOpen && <span className="font-medium">{item.name}</span>}
                        </Link>
                        {/* Sub-tabs */}
                        {item.subTabs && (
                          <ul className={cn('ml-8 mt-1 flex flex-col gap-1', sidebarOpen ? '' : 'ml-0 items-center')}> 
                            {item.subTabs.map((sub) => {
                              const SubIcon = sub.icon;
                              const subActive = pathname.includes(sub.path.replace('[clientId]', clientId));
                              return (
                                <li key={sub.path} className="w-full">
                                  <Link
                                    href={sub.path.replace('[clientId]', clientId)}
                                    className={cn(
                                      'sidebar-item flex items-center gap-2 rounded-md text-sm transition-colors font-normal border-l-4 border-transparent',
                                      'px-[12px] py-2',
                                      subActive
                                        ? 'bg-[#e2e8f0] font-semibold border-l-4 border-indigo-600 text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground hover:bg-[#f0f4f8] hover:font-medium hover:border-l-4 hover:border-indigo-400',
                                      sidebarOpen ? '' : 'justify-center px-0',
                                    )}
                                    style={{ minHeight: 40 }}
                                  >
                                    <SubIcon className="w-5 h-5" />
                                    {sidebarOpen && <span>{sub.name}</span>}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </nav>
      </aside>
      {/* Overlay for mobile/tablet when sidebar is open */}
      {!sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setSidebarOpen(true)} />
      )}
    </>
  );
} 