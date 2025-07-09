'use client';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export function CRMIntegrationClient({ client, clientCrms, crmConnections, customFields, availableCrmsToAdd }: { 
  client: Client;
  clientCrms: CRM[];
  crmConnections: CRMConnection[];
  customFields: CustomField[];
  availableCrmsToAdd: CRM[];
}) {
  const [activeTab, setActiveTab] = React.useState('Pipedrive');
  const [addCrmOpen, setAddCrmOpen] = React.useState(false);

  function handleAddCrm(crmKey: string) {
    setAddCrmOpen(false);
    window.alert(`Add config for ${crmKey} (not implemented)`);
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <TabsList>
          {clientCrms.map((crm) => (
            <TabsTrigger key={crm.key} value={crm.key} className="flex items-center gap-2">
              <StatusIndicator active={!!crmConnections.find((c) => c.app === crm.key && c.isActive)} />
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
        const connection = crmConnections.find((c) => c.app === crm.key) as CRMConnection | undefined;
        return (
          <TabsContent key={crm.key} value={crm.key} className="space-y-8">
            {/* Connection & Authentication */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Link2 className="w-5 h-5" /> Connection Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <StatusIndicator active={!!connection?.isActive} />
                  <span className="font-semibold">{connection?.isActive ? 'Active' : 'Inactive'}</span>
                  <Switch checked={!!connection?.isActive} />
                  <span className="ml-4 text-xs text-muted-foreground">Connection ID: <span className="font-mono">{connection?.connectionId || '—'}</span></span>
                  <span className="ml-4 text-xs text-muted-foreground">Last updated: {connection?.updatedDate ? new Date(connection.updatedDate * 1000).toLocaleString() : '—'}</span>
                </div>
                {/* Auth fields */}
                {crm.key === 'Pipedrive' && (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <Input className="w-full md:w-96" placeholder="API Key" defaultValue={connection?.apiKey || ''} />
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
                        <td className="p-2 max-w-[160px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block truncate">leadApplicantName</span>
                              </TooltipTrigger>
                              <TooltipContent>leadApplicantName</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-2 max-w-[180px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Input className="w-48 truncate" placeholder="CRM Field Name" />
                              </TooltipTrigger>
                              <TooltipContent>CRM Field Name</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-2 max-w-[140px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Input className="w-32 truncate" placeholder="Default Value" />
                              </TooltipTrigger>
                              <TooltipContent>Default Value</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 max-w-[160px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block truncate">companyName</span>
                              </TooltipTrigger>
                              <TooltipContent>companyName</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-2 max-w-[180px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Input className="w-48 truncate" placeholder="CRM Field Name" />
                              </TooltipTrigger>
                              <TooltipContent>CRM Field Name</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-2 max-w-[140px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Input className="w-32 truncate" placeholder="Default Value" />
                              </TooltipTrigger>
                              <TooltipContent>Default Value</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
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
                        {customFields.map((field, idx) => (
                          <tr key={field.custom_field_id || idx}>
                            <td className="p-2 max-w-[180px] truncate">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{field.custom_field_name}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>{field.custom_field_name}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="p-2 max-w-[180px] truncate">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{field.normilized_field_name}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>{field.normilized_field_name}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="p-2 max-w-[160px] truncate font-mono">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{field.custom_field_id}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>{field.custom_field_id}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="p-2"><Button variant="ghost" size="icon"><XCircle className="w-4 h-4 text-destructive" /></Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
  );
} 