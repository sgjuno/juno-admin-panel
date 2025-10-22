import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DocumentUploader from './DocumentUploader';
import { Client } from '@/types/Client';

interface ClientConfig {
  companyName: string;
  pocName: string;
  pocContact: string;
  emailDomain: string;
  clientCode: string;
  configurations: Record<string, string>;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (client: Client) => Promise<void>;
  existingClients: Client[];
  error?: string | null;
}

export default function AddClientModal({ isOpen, onClose, onAdd, existingClients, error }: AddClientModalProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [formData, setFormData] = useState<Client>({
    pocName: '',
    pocContact: '',
    type: 'BROKER',
    website: '',
    companyName: '',
    companyNumber: 0,
    address: '',
    country: '',
    isActive: true,
    carFinanceDomain: false,
    propertyFinanceDomain: false,
    smeFinanceDomain: false,
    clientCode: '',
    emailDomain: '',
    onboardedAt: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showCopyConfig, setShowCopyConfig] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.pocName) errs.pocName = 'POC Name is required';
    if (!formData.pocContact) errs.pocContact = 'POC Contact is required';
    if (!formData.companyName) errs.companyName = 'Company Name is required';
    if (!formData.clientCode) errs.clientCode = 'Client Code is required';
    if (!formData.emailDomain) errs.emailDomain = 'Email Domain is required';
    if (!formData.type) errs.type = 'Type is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    let clientData = { ...formData };
    if (selectedClient) {
      const sourceClient = existingClients.find(c => c._id === selectedClient);
      if (sourceClient) {
        clientData = {
          ...sourceClient,
          ...formData,
          _id: undefined,
          isActive: false,
          onboardedAt: Date.now(),
        };
      }
    }
    try {
      await onAdd(clientData);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      // Check for duplicate field errors
      if (err.message?.includes('clientCode')) {
        setErrors({ clientCode: 'This client code is already in use' });
      } else if (err.message?.includes('emailDomain')) {
        setErrors({ emailDomain: 'This email domain is already in use' });
      } else {
        setErrors({ submit: err.message || 'Failed to create client' });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyConfig = (clientId: string) => {
    const sourceClient = existingClients.find(c => c._id === clientId);
    if (sourceClient) {
      setFormData(prev => ({
        ...prev,
        type: sourceClient.type === 'LENDER' ? 'LENDER' : 'BROKER',
        carFinanceDomain: sourceClient.carFinanceDomain ?? false,
        propertyFinanceDomain: sourceClient.propertyFinanceDomain ?? false,
        smeFinanceDomain: sourceClient.smeFinanceDomain ?? false,
        pocName: sourceClient.pocName || '',
        pocContact: sourceClient.pocContact || '',
        website: sourceClient.website || '',
        companyName: sourceClient.companyName || '',
        companyNumber: sourceClient.companyNumber || '',
        address: sourceClient.address || '',
        country: sourceClient.country || '',
        clientCode: sourceClient.clientCode || '',
        emailDomain: sourceClient.emailDomain || '',
        onboardedAt: typeof sourceClient.onboardedAt === 'number' ? sourceClient.onboardedAt : undefined,
      }));
    }
    setShowCopyConfig(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowCopyConfig(!showCopyConfig)}
            >
              {showCopyConfig ? 'Hide Copy Configuration' : 'Copy Configuration from Existing Client'}
            </Button>
          </div>

          {showCopyConfig && (
            <div className="space-y-4">
              <Select
                value={selectedClient || ''}
                onValueChange={handleCopyConfig}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client to copy from" />
                </SelectTrigger>
                <SelectContent>
                  {existingClients.map((client) => (
                    <SelectItem key={client._id || ''} value={client._id || ''}>
                      {client.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pocName">POC Name</Label>
                <Input
                  id="pocName"
                  name="pocName"
                  value={formData.pocName}
                  onChange={handleChange}
                  className={errors.pocName ? 'border-red-500' : ''}
                />
                {errors.pocName && <p className="text-sm text-red-500">{errors.pocName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pocContact">POC Contact</Label>
                <Input
                  id="pocContact"
                  name="pocContact"
                  value={formData.pocContact}
                  onChange={handleChange}
                  className={errors.pocContact ? 'border-red-500' : ''}
                />
                {errors.pocContact && <p className="text-sm text-red-500">{errors.pocContact}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'BROKER' | 'LENDER' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BROKER">Broker</SelectItem>
                    <SelectItem value="LENDER">Lender</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyNumber">Company Number</Label>
                <Input
                  id="companyNumber"
                  name="companyNumber"
                  value={formData.companyNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientCode">Client Code</Label>
                <Input
                  id="clientCode"
                  name="clientCode"
                  value={formData.clientCode}
                  onChange={handleChange}
                  className={errors.clientCode ? 'border-red-500' : ''}
                />
                {errors.clientCode && <p className="text-sm text-red-500">{errors.clientCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailDomain">Email Domain</Label>
                <Input
                  id="emailDomain"
                  name="emailDomain"
                  value={formData.emailDomain}
                  onChange={handleChange}
                  className={errors.emailDomain ? 'border-red-500' : ''}
                />
                {errors.emailDomain && <p className="text-sm text-red-500">{errors.emailDomain}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="carFinanceDomain"
                  checked={formData.carFinanceDomain}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, carFinanceDomain: checked }))}
                />
                <Label htmlFor="carFinanceDomain">Car Finance Domain</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="propertyFinanceDomain"
                  checked={formData.propertyFinanceDomain}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, propertyFinanceDomain: checked }))}
                />
                <Label htmlFor="propertyFinanceDomain">Property Finance Domain</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smeFinanceDomain"
                  checked={formData.smeFinanceDomain}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smeFinanceDomain: checked }))}
                />
                <Label htmlFor="smeFinanceDomain">SME Finance Domain</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Client'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 