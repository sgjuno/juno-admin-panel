'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Settings } from 'lucide-react';

const FEATURE_FLAGS = [
  { key: 'ntropyProcessing', label: 'Ntropy Processing' },
  { key: 'directorSearch', label: 'Director Search' },
  { key: 'openBanking', label: 'Open Banking' },
  { key: 'bypassBusinessAccNameValidation', label: 'Bypass Business Account Name Validation' },
  { key: 'propertyEnrichment', label: 'Property Enrichment' },
  { key: 'saveEmailBody', label: 'Save Email Body' },
  { key: 'bankStatements', label: 'Bank Statements' },
  { key: 'decisionEngineCall', label: 'Decision Engine Call' },
  { key: 'documentProcessing', label: 'Document Processing' },
  { key: 'linkExtraction', label: 'Link Extraction' },
];

export default function FeatureFlagsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<any>({});

  useEffect(() => {
    async function fetchClient() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const data = await res.json();
        setClient(data);
        setFeatureFlags(data.feature_flags || {});
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
          <h1 className="text-2xl font-bold">Feature Flags for {client.companyName}</h1>
          <p className="text-muted-foreground">Toggle feature flags for this client</p>
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
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURE_FLAGS.map(flag => (
              <div key={flag.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted">
                <span className="font-medium">{flag.label}</span>
                <Switch
                  checked={!!featureFlags[flag.key]}
                  onCheckedChange={checked => setFeatureFlags({ ...featureFlags, [flag.key]: checked })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 