'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Client {
  _id: string;
  companyName: string;
  type: string;
  pocName: string;
  pocContact: string;
  website: string;
  isActive: boolean;
  clientCode: string;
  country: string;
  companyNumber: number;
  address: string;
  emailDomain: string;
  nylasGrantId?: string;
  emailAction?: string;
  adminEmail?: string[];
  enquireEmail?: string;
  carFinanceDomain: boolean;
  propertyFinanceDomain: boolean;
  smeFinanceDomain: boolean;
  onboardedAt?: number;
  createdAt?: number;
  updatedAt?: number;
}

export default function ClientBasicInfoPageClient({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        setClient(data);
        setLoading(false);
      });
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return;
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return;
    const value = e.target.value === '' ? undefined : Number(e.target.value);
    setClient({ ...client, [e.target.name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!client) return;
    setClient({ ...client, [name]: value });
  };

  const handleToggle = (field: string, checked: boolean) => {
    if (!client) return;
    setClient({ ...client, [field]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    if (res.ok) {
      setSuccess('Changes saved successfully!');
    } else {
      setError('Failed to save changes. Please try again.');
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
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
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
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Basic Information</h1>
        <p className="text-muted-foreground">
          Update your client's basic information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={client.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={client.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BROKER">BROKER</SelectItem>
                    <SelectItem value="LENDER">LENDER</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pocName">POC Name</Label>
                <Input
                  id="pocName"
                  name="pocName"
                  value={client.pocName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pocContact">POC Contact</Label>
                <Input
                  id="pocContact"
                  name="pocContact"
                  value={client.pocContact}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={client.website}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientCode">Client Code</Label>
                <Input
                  id="clientCode"
                  name="clientCode"
                  value={client.clientCode}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyNumber">Company Number</Label>
                <Input
                  id="companyNumber"
                  name="companyNumber"
                  type="number"
                  value={client.companyNumber || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailDomain">Email Domain</Label>
                <Input
                  id="emailDomain"
                  name="emailDomain"
                  value={client.emailDomain}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={client.country}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={client.address}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nylasGrantId">Nylas Grant ID</Label>
                <Input
                  id="nylasGrantId"
                  name="nylasGrantId"
                  value={client.nylasGrantId || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enquireEmail">Enquire Email</Label>
                <Input
                  id="enquireEmail"
                  name="enquireEmail"
                  value={client.enquireEmail || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Domain Settings</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="carFinanceDomain"
                    checked={client.carFinanceDomain}
                    onCheckedChange={(checked) => handleToggle('carFinanceDomain', checked)}
                  />
                  <Label htmlFor="carFinanceDomain">Car Finance Domain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="propertyFinanceDomain"
                    checked={client.propertyFinanceDomain}
                    onCheckedChange={(checked) => handleToggle('propertyFinanceDomain', checked)}
                  />
                  <Label htmlFor="propertyFinanceDomain">Property Finance Domain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smeFinanceDomain"
                    checked={client.smeFinanceDomain}
                    onCheckedChange={(checked) => handleToggle('smeFinanceDomain', checked)}
                  />
                  <Label htmlFor="smeFinanceDomain">SME Finance Domain</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={client.isActive}
                  onCheckedChange={(checked) => handleToggle('isActive', checked)}
                />
                <Label htmlFor="isActive" className="text-muted-foreground">
                  {client.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-2">
                {success && (
                  <Alert className="bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 