'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface FeatureFlags {
  ntropyProcessing?: boolean;
  directorSearch?: boolean;
  bypassBusinessAccNameValidation?: boolean;
  propertyEnrichment?: boolean;
  linkExtraction?: boolean;
  bankStatements?: boolean;
  isEmailLabellingDisabled?: boolean;
}

interface Client {
  _id: string;
  companyName: string;
  feature_flags?: FeatureFlags;
}

export default function FeatureFlagsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const clientData = await res.json();
        setClient(clientData);
        setFeatureFlags(clientData.feature_flags || {});
        setLoading(false);
      } catch (err) {
        setError('Failed to load client data');
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const handleToggle = (flag: keyof FeatureFlags, checked: boolean) => {
    setFeatureFlags(prev => ({
      ...prev,
      [flag]: checked
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_flags: featureFlags }),
      });
      
      if (res.ok) {
        setSuccess('Feature flags updated successfully!');
      } else {
        setError('Failed to update feature flags.');
      }
    } catch (err) {
      setError('Failed to save changes.');
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Client not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Configure feature flags for {client.companyName}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {success && (
        <Alert className="bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="ntropyProcessing" className="text-base font-medium">
                  Ntropy Processing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable Ntropy data processing for enhanced data extraction
                </p>
              </div>
              <Switch
                id="ntropyProcessing"
                checked={featureFlags.ntropyProcessing || false}
                onCheckedChange={(checked) => handleToggle('ntropyProcessing', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="directorSearch" className="text-base font-medium">
                  Director Search
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable director search functionality for company verification
                </p>
              </div>
              <Switch
                id="directorSearch"
                checked={featureFlags.directorSearch || false}
                onCheckedChange={(checked) => handleToggle('directorSearch', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="bypassBusinessAccNameValidation" className="text-base font-medium">
                  Bypass Business Account Name Validation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Skip business account name validation checks
                </p>
              </div>
              <Switch
                id="bypassBusinessAccNameValidation"
                checked={featureFlags.bypassBusinessAccNameValidation || false}
                onCheckedChange={(checked) => handleToggle('bypassBusinessAccNameValidation', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="propertyEnrichment" className="text-base font-medium">
                  Property Enrichment
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable property data enrichment features
                </p>
              </div>
              <Switch
                id="propertyEnrichment"
                checked={featureFlags.propertyEnrichment || false}
                onCheckedChange={(checked) => handleToggle('propertyEnrichment', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="linkExtraction" className="text-base font-medium">
                  Link Extraction
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic link extraction from documents
                </p>
              </div>
              <Switch
                id="linkExtraction"
                checked={featureFlags.linkExtraction || false}
                onCheckedChange={(checked) => handleToggle('linkExtraction', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="bankStatements" className="text-base font-medium">
                  Bank Statements
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable bank statement processing features
                </p>
              </div>
              <Switch
                id="bankStatements"
                checked={featureFlags.bankStatements || false}
                onCheckedChange={(checked) => handleToggle('bankStatements', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="isEmailLabellingDisabled" className="text-base font-medium">
                  Disable Email Labelling
                </Label>
                <p className="text-sm text-muted-foreground">
                  Disable automatic email labelling functionality
                </p>
              </div>
              <Switch
                id="isEmailLabellingDisabled"
                checked={featureFlags.isEmailLabellingDisabled || false}
                onCheckedChange={(checked) => handleToggle('isEmailLabellingDisabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 