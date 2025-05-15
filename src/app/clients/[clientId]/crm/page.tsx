'use client';
import React from 'react';
import { useState, useEffect } from 'react';
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

const ALL_UNIQUE_CRMS = [
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

export default function CRMIntegrationPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pipedrive');
  const [error, setError] = useState('');
  const [addCrmOpen, setAddCrmOpen] = useState(false);

  useEffect(() => {
    async function fetchClient() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const data = await res.json();
        setClient(data);
      } catch (e) {
        setError('Failed to load client data');
      }
      setLoading(false);
    }
    fetchClient();
  }, [clientId]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  if (!client) {
    return <Alert variant="destructive" className="m-6"><AlertDescription>Client not found.</AlertDescription></Alert>;
  }

  const crmConnections = client.unified?.crm || [];
  const customFields = client.custom_fields || [];
  // Only show CRMs configured for this client
  const clientCrms = crmConnections.map((c: any) => ALL_UNIQUE_CRMS.find(crm => crm.key === c.app)).filter(Boolean);
  // For Add CRM dropdown: only show CRMs not already configured
  const availableCrmsToAdd = ALL_UNIQUE_CRMS.filter(crm => !crmConnections.some((c: any) => c.app === crm.key));

  // Handler for adding a new CRM config (UI only for now)
  function handleAddCrm(crmKey: string) {
    setAddCrmOpen(false);
    window.alert(`Add config for ${crmKey} (not implemented)`);
    // Here you would call your API to add the CRM config for this client
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">CRM Integration for {client.companyName}</h1>
          <p className="text-muted-foreground">Manage CRM connections, field mapping, and sync settings</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <TabsList>
            {clientCrms.map((crm: { key: string; label: string }) => (
              <TabsTrigger key={crm.key} value={crm.key} className="flex items-center gap-2">
                <StatusIndicator active={!!crmConnections.find((c: any) => c.app === crm.key && c.isActive)} />
                {crm.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Popover open={addCrmOpen} onOpenChange={setAddCrmOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-2 flex items-center gap-2"><Plus className="w-4 h-4" /> Add CRM</Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <Command>
                <CommandInput placeholder="Search CRM..." />
                <CommandList>
                  {availableCrmsToAdd.length === 0 && <CommandEmpty>No CRMs available</CommandEmpty>}
                  {availableCrmsToAdd.map((crm) => (
                    <CommandItem key={crm.key} value={crm.key} onSelect={() => handleAddCrm(crm.key)}>
                      {crm.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {ALL_UNIQUE_CRMS.map((crm) => {
          const connection = crmConnections.find((c: any) => c.app === crm.key) || {};
          return (
            <TabsContent key={crm.key} value={crm.key} className="space-y-8">
              {/* Connection & Authentication */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Link2 className="w-5 h-5" /> Connection Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <StatusIndicator active={!!connection.isActive} />
                    <span className="font-semibold">{connection.isActive ? 'Active' : 'Inactive'}</span>
                    <Switch checked={!!connection.isActive} />
                    <span className="ml-4 text-xs text-muted-foreground">Connection ID: <span className="font-mono">{connection.connectionId || '—'}</span></span>
                    <span className="ml-4 text-xs text-muted-foreground">Last updated: {connection.updatedDate ? new Date(connection.updatedDate * 1000).toLocaleString() : '—'}</span>
                  </div>
                  {/* Auth fields */}
                  {crm.key === 'Pipedrive' && (
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <Input className="w-full md:w-96" placeholder="API Key" defaultValue={connection.apiKey || ''} />
                      <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Test Connection</Button>
                    </div>
                  )}
                  {crm.key === 'Salesforce' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input className="w-full" placeholder="Client ID" />
                      <Input className="w-full" placeholder="Client Secret" />
                      <Input className="w-full" placeholder="Auth Endpoint URL" />
                      <Input className="w-full" placeholder="Token Endpoint URL" />
                      <Input className="w-full" placeholder="Redirect URI" />
                      <Button variant="outline" className="gap-2 col-span-2"><RefreshCw className="w-4 h-4" /> Test Connection</Button>
                    </div>
                  )}
                  {/* Add similar blocks for Hubspot, Zoho as needed */}
                </CardContent>
              </Card>
              {/* Field Mapping */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Field Mapping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border rounded">
                      <thead>
                        <tr className="bg-muted text-left">
                          <th className="p-2 font-semibold">System Data Point</th>
                          <th className="p-2 font-semibold">CRM Field</th>
                          <th className="p-2 font-semibold">Default Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Example mapping rows, replace with real data points */}
                        <tr>
                          <td className="p-2">leadApplicantName</td>
                          <td className="p-2"><Input className="w-48" placeholder="CRM Field Name" /></td>
                          <td className="p-2"><Input className="w-32" placeholder="Default Value" /></td>
                        </tr>
                        <tr>
                          <td className="p-2">companyName</td>
                          <td className="p-2"><Input className="w-48" placeholder="CRM Field Name" /></td>
                          <td className="p-2"><Input className="w-32" placeholder="Default Value" /></td>
                        </tr>
                        {/* Add more rows dynamically */}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Custom Fields</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border rounded">
                        <thead>
                          <tr className="bg-muted text-left">
                            <th className="p-2 font-semibold">Custom Field Name</th>
                            <th className="p-2 font-semibold">Normalized Name</th>
                            <th className="p-2 font-semibold">Custom Field ID</th>
                            <th className="p-2 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customFields.map((field: any, idx: number) => (
                            <tr key={field.custom_field_id || idx}>
                              <td className="p-2">{field.custom_field_name}</td>
                              <td className="p-2">{field.normilized_field_name}</td>
                              <td className="p-2 font-mono">{field.custom_field_id}</td>
                              <td className="p-2"><Button variant="ghost" size="icon"><XCircle className="w-4 h-4 text-destructive" /></Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button variant="outline" className="mt-2"><Plus className="w-4 h-4 mr-2" /> Add Custom Field</Button>
                  </div>
                </CardContent>
              </Card>
              {/* Sync Settings */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Sync Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Sync Direction:</span>
                    <Button variant="outline">One-way</Button>
                    <Button variant="outline">Bidirectional</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Sync Frequency:</span>
                    <Button variant="outline">Real-time</Button>
                    <Button variant="outline">Scheduled</Button>
                    <Button variant="outline">Manual</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Schedule:</span>
                    <Input className="w-48" placeholder="e.g. Every 6 hours" />
                  </div>
                  <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Test Sync</Button>
                </CardContent>
              </Card>
              {/* Permissions */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Who can edit integration settings?</span>
                    <Button variant="outline">Admins Only</Button>
                    <Button variant="outline">All Users</Button>
                  </div>
                </CardContent>
              </Card>
              {/* Connection History */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Connection History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">(Mocked) Log of connection attempts and status changes will appear here.</div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
} 