'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Settings } from 'lucide-react';

export default function ResponsePromptsPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [responsePrompts, setResponsePrompts] = useState<any>({});

  useEffect(() => {
    async function fetchClient() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const data = await res.json();
        setClient(data);
        setResponsePrompts(data.responsePrompts || {});
      } catch (e) {
        setError('Failed to load client data');
      }
      setLoading(false);
    }
    fetchClient();
  }, [clientId]);

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
          <h1 className="text-2xl font-bold">Response Prompts for {client.companyName}</h1>
          <p className="text-muted-foreground">Manage email response templates and prompts</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Response Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="font-semibold">General Case</label>
            <Textarea 
              value={responsePrompts.generalCase || ''} 
              onChange={e => setResponsePrompts({ ...responsePrompts, generalCase: e.target.value })} 
              rows={6}
              placeholder="Template for general case responses..."
            />
          </div>
          <div className="space-y-2">
            <label className="font-semibold">No Next Questions Case</label>
            <Textarea 
              value={responsePrompts.noNextQuestionsCase || ''} 
              onChange={e => setResponsePrompts({ ...responsePrompts, noNextQuestionsCase: e.target.value })} 
              rows={6}
              placeholder="Template for cases with no further questions..."
            />
          </div>
          <div className="space-y-2">
            <label className="font-semibold">Irrelevant Case</label>
            <Textarea 
              value={responsePrompts.irrelevantCase || ''} 
              onChange={e => setResponsePrompts({ ...responsePrompts, irrelevantCase: e.target.value })} 
              rows={4}
              placeholder="Template for irrelevant cases..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 