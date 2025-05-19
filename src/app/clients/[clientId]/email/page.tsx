'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Mail, Settings, RefreshCw, Shield, ChevronRight } from 'lucide-react';

export default function EmailConfigPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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

  // Editable state for all config fields
  const [enquireEmail, setEnquireEmail] = useState<string[]>([]);
  const [formEmail, setFormEmail] = useState<string[]>([]);
  const [adminEmail, setAdminEmail] = useState<string[]>([]);
  const [emailDomain, setEmailDomain] = useState('');
  const [emailAction, setEmailAction] = useState('SEND');
  const [responsePrompts, setResponsePrompts] = useState<any>({});
  const [followUpConfig, setFollowUpConfig] = useState<any>({});
  const [irrelevancyConfig, setIrrelevancyConfig] = useState<any>({});
  const [nylasGrantId, setNylasGrantId] = useState('');
  const [featureFlags, setFeatureFlags] = useState<any>({});

  // Populate editable state from client data
  useEffect(() => {
    if (!client) return;
    setEnquireEmail(Array.isArray(client.enquireEmail) ? client.enquireEmail : client.enquireEmail ? [client.enquireEmail] : []);
    setFormEmail(Array.isArray(client.formEmail) ? client.formEmail : client.formEmail ? [client.formEmail] : []);
    setAdminEmail(Array.isArray(client.adminEmail) ? client.adminEmail : client.adminEmail ? [client.adminEmail] : []);
    setEmailDomain(client.emailDomain || '');
    setEmailAction(client.emailAction || 'SEND');
    setResponsePrompts(client.responsePrompts || {});
    setFollowUpConfig(client.followUpConfig || {});
    setIrrelevancyConfig(client.irrelevancyConfig || {});
    setNylasGrantId(client.nylasGrantId || '');
    setFeatureFlags(client.feature_flags || {});
  }, [client]);

  function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    // TODO: API call to save config
    setTimeout(() => {
      setSaving(false);
      setSuccess('Saved successfully!');
    }, 1000);
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  if (!client) {
    return <Alert variant="destructive" className="m-6"><AlertDescription>Client not found.</AlertDescription></Alert>;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Email Configuration for {client.companyName}</h1>
          <p className="text-muted-foreground">Manage all email settings, templates, and integrations</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      {success && (
        <Alert className="bg-green-50">
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>
        {/* General Email Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> General Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Enquire Email</label>
                  {enquireEmail.map((email, idx) => (
                    <div key={idx} className="flex gap-2 mt-1">
                      <Input value={email} onChange={e => setEnquireEmail(enquireEmail.map((em, i) => i === idx ? e.target.value : em))} />
                      <Button variant="ghost" size="icon" onClick={() => setEnquireEmail(enquireEmail.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" className="mt-2" onClick={() => setEnquireEmail([...enquireEmail, ''])}><Plus className="w-4 h-4 mr-2" /> Add Email</Button>
                </div>
                <div>
                  <label className="font-semibold">Form Email</label>
                  {formEmail.map((email, idx) => (
                    <div key={idx} className="flex gap-2 mt-1">
                      <Input value={email} onChange={e => setFormEmail(formEmail.map((em, i) => i === idx ? e.target.value : em))} />
                      <Button variant="ghost" size="icon" onClick={() => setFormEmail(formEmail.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" className="mt-2" onClick={() => setFormEmail([...formEmail, ''])}><Plus className="w-4 h-4 mr-2" /> Add Email</Button>
                </div>
                <div>
                  <label className="font-semibold">Admin Email</label>
                  {adminEmail.map((email, idx) => (
                    <div key={idx} className="flex gap-2 mt-1">
                      <Input value={email} onChange={e => setAdminEmail(adminEmail.map((em, i) => i === idx ? e.target.value : em))} />
                      <Button variant="ghost" size="icon" onClick={() => setAdminEmail(adminEmail.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" className="mt-2" onClick={() => setAdminEmail([...adminEmail, ''])}><Plus className="w-4 h-4 mr-2" /> Add Email</Button>
                </div>
                <div>
                  <label className="font-semibold">Email Domain</label>
                  <Input value={emailDomain} onChange={e => setEmailDomain(e.target.value)} placeholder="e.g. company.com" />
                </div>
                <div>
                  <label className="font-semibold">Email Action</label>
                  <Select value={emailAction} onValueChange={setEmailAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEND">Send</SelectItem>
                      <SelectItem value="FORWARD">Forward</SelectItem>
                      <SelectItem value="REPLY">Reply</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Email Integration */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Email Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Nylas Grant ID</span>
                <Input value={nylasGrantId} onChange={e => setNylasGrantId(e.target.value)} placeholder="Nylas Grant ID" />
                <Button variant="outline">Connect</Button>
                <Button variant="outline" className="text-destructive">Disconnect</Button>
              </div>
              <div className="text-xs text-muted-foreground">Status: {nylasGrantId ? 'Connected' : 'Not Connected'}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 