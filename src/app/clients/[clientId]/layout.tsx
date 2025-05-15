'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowLeft, Settings, FileText, ListChecks, Link2, Mail, ListPlus, MessageSquare, Clock, AlertTriangle, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
  { name: 'Basic Information', path: '', icon: Settings },
  { name: 'Rule Criteria', path: 'rule-criteria', icon: ListChecks },
  { name: 'Required Details', path: 'required-details', icon: FileText },
  { name: 'Flow Visualizer', path: 'required-details-visualizer', icon: GitBranch },
  { name: 'CRM Integration', path: 'crm', icon: Link2 },
  { name: 'Email Configuration', path: 'email', icon: Mail },
  { name: 'Custom Fields', path: 'custom-fields', icon: ListPlus },
  { name: 'Response Prompts', path: 'response-prompts', icon: MessageSquare },
  { name: 'Follow-up Settings', path: 'follow-up', icon: Clock },
  { name: 'Irrelevancy Handling', path: 'irrelevancy-handling', icon: AlertTriangle },
  { name: 'Feature Flags', path: 'feature-flags', icon: Settings },
];

export default function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const pathname = usePathname();
  const base = `/clients/${clientId}`;

  return (
    <div className="flex min-h-screen">
      <div className="w-64 border-r bg-sidebar">
        <div className="p-6">
          <Link href="/clients" className="mb-4 w-full">
            <Button variant="ghost" className="w-full justify-start gap-2" aria-label="Back to Clients">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-6">Configure Client</h2>
          <nav>
            <ul className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = pathname === (section.path ? `${base}/${section.path}` : base);
                return (
                  <li key={section.name}>
                    <Link
                      href={section.path ? `${base}/${section.path}` : base}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {section.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
} 