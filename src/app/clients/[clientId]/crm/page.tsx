import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw, CheckCircle, XCircle, Key, Link2, UserCog, History, Shield, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { CRMIntegrationClient } from '@/app/clients/[clientId]/crm/components/CRMIntegrationClient';

interface CRM {
  key: string;
  label: string;
}

interface CRMConnection {
  app: string;
  isActive: boolean;
  connectionId?: string;
  updatedDate?: number;
  apiKey?: string;
}

interface CustomField {
  custom_field_id: string;
  custom_field_name: string;
  normilized_field_name: string;
}

interface Client {
  companyName: string;
  unified?: {
    crm: CRMConnection[];
  };
  custom_fields: CustomField[];
}

const ALL_UNIQUE_CRMS: CRM[] = [
  { key: 'Pipedrive', label: 'Pipedrive' },
  { key: 'Salesforce', label: 'Salesforce' },
  { key: 'Hubspot', label: 'Hubspot' },
  { key: 'Zoho', label: 'Zoho' },
];

function StatusIndicator({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${active ? 'bg-green-500' : 'bg-red-500'}`} />
  );
}

// Server component
export default async function CRMIntegrationPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await React.use(params);
  
  // Fetch data directly on the server
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/clients/${clientId}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return <Alert variant="destructive" className="m-6"><AlertDescription>Failed to load client data.</AlertDescription></Alert>;
    }
  
  const client: Client = await res.json();
  
  if (!client) {
    return <Alert variant="destructive" className="m-6"><AlertDescription>Client not found.</AlertDescription></Alert>;
  }

  const crmConnections = client.unified?.crm || [];
  const customFields = client.custom_fields || [];
  const clientCrms = crmConnections.map((c: CRMConnection) => ALL_UNIQUE_CRMS.find(crm => crm.key === c.app)).filter((crm): crm is CRM => crm !== undefined);
  const availableCrmsToAdd = ALL_UNIQUE_CRMS.filter(crm => !crmConnections.some((c: CRMConnection) => c.app === crm.key));

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">CRM Integration for {client.companyName}</h1>
          <p className="text-muted-foreground">Manage CRM connections, field mapping, and sync settings</p>
        </div>
      </div>
      <CRMIntegrationClient 
        client={client}
        clientCrms={clientCrms}
        crmConnections={crmConnections}
        customFields={customFields}
        availableCrmsToAdd={availableCrmsToAdd}
      />
    </div>
  );
} 