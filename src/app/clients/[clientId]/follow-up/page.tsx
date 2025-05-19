'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';

export default function FollowUpPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [followUpConfig, setFollowUpConfig] = useState<any>({
    isActive: false,
    configType: 'FLAT',
    flatGapInterval: [],
    noOfFollowUps: 0
  });

  useEffect(() => {
    async function fetchClient() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const data = await res.json();
        setClient(data);
        setFollowUpConfig(data.followUpConfig || {
          isActive: false,
          configType: 'FLAT',
          flatGapInterval: [],
          noOfFollowUps: 0
        });
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
          <h1 className="text-2xl font-bold">Follow-up Automation for {client.companyName}</h1>
          <p className="text-muted-foreground">Configure automated follow-up settings</p>
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
          <CardTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Follow-up Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Enable Follow-ups</span>
            <Switch 
              checked={followUpConfig.isActive} 
              onCheckedChange={checked => setFollowUpConfig({ ...followUpConfig, isActive: checked })} 
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold">Type</span>
            <Input 
              value={followUpConfig.configType || ''} 
              onChange={e => setFollowUpConfig({ ...followUpConfig, configType: e.target.value })} 
              placeholder="e.g. FLAT" 
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Flat Gap Interval (days)</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFollowUpConfig({ 
                  ...followUpConfig, 
                  flatGapInterval: [...(followUpConfig.flatGapInterval || []), 1] 
                })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Interval
              </Button>
            </div>
            <div className="space-y-2">
              {(followUpConfig.flatGapInterval || []).map((val: number, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input 
                    type="number" 
                    value={val} 
                    onChange={e => setFollowUpConfig({ 
                      ...followUpConfig, 
                      flatGapInterval: followUpConfig.flatGapInterval.map((v: number, i: number) => 
                        i === idx ? Number(e.target.value) : v
                      ) 
                    })} 
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFollowUpConfig({ 
                      ...followUpConfig, 
                      flatGapInterval: followUpConfig.flatGapInterval.filter((_: any, i: number) => i !== idx) 
                    })}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="font-semibold">Number of Follow-ups</span>
            <Input 
              type="number" 
              value={followUpConfig.noOfFollowUps || ''} 
              onChange={e => setFollowUpConfig({ ...followUpConfig, noOfFollowUps: Number(e.target.value) })} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 