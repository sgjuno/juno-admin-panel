import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Client } from '@/types/Client';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (clientData: any) => Promise<boolean>;
  error?: string | null;
}

export default function EditClientModal({ isOpen, onClose, client, onEdit, error }: EditClientModalProps) {
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
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        pocName: client.pocName || '',
        pocContact: client.pocContact || '',
        type: client.type === 'LENDER' ? 'LENDER' : 'BROKER',
        website: client.website || '',
        companyName: client.companyName || '',
        companyNumber: client.companyNumber || 0,
        address: client.address || '',
        country: client.country || '',
        isActive: typeof client.isActive === 'boolean' ? client.isActive : true,
        carFinanceDomain: typeof client.carFinanceDomain === 'boolean' ? client.carFinanceDomain : false,
        propertyFinanceDomain: typeof client.propertyFinanceDomain === 'boolean' ? client.propertyFinanceDomain : false,
        smeFinanceDomain: typeof client.smeFinanceDomain === 'boolean' ? client.smeFinanceDomain : false,
        clientCode: client.clientCode || '',
        emailDomain: client.emailDomain || '',
        onboardedAt: client.onboardedAt,
      });
    }
  }, [client]);

  const validate = () => {
    const errs: any = {};
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
    const success = await onEdit({ ...client, ...formData });
    setLoading(false);
    if (success) onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-center justify-center p-4 text-center bg-black/30">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Card className="w-full max-w-2xl rounded-2xl shadow-md border p-0">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <Dialog.Title as="h3" className="text-xl font-bold">
                  Edit Client
                </Dialog.Title>
                <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
                  <XMarkIcon className="w-6 h-6" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pocName">POC Name</Label>
                      <Input
                        id="pocName"
                        name="pocName"
                        value={formData.pocName}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.pocName}
                        aria-describedby="pocName-error"
                        className={errors.pocName ? 'border-red-500' : ''}
                      />
                      {errors.pocName && <div id="pocName-error" className="text-xs text-red-500 mt-1">{errors.pocName}</div>}
                    </div>
                    <div>
                      <Label htmlFor="pocContact">POC Contact</Label>
                      <Input
                        id="pocContact"
                        name="pocContact"
                        value={formData.pocContact}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.pocContact}
                        aria-describedby="pocContact-error"
                        className={errors.pocContact ? 'border-red-500' : ''}
                      />
                      {errors.pocContact && <div id="pocContact-error" className="text-xs text-red-500 mt-1">{errors.pocContact}</div>}
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={val => setFormData(prev => ({ ...prev, type: val === 'LENDER' ? 'LENDER' : 'BROKER' }))}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BROKER">Broker</SelectItem>
                          <SelectItem value="LENDER">Lender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.companyName}
                        aria-describedby="companyName-error"
                        className={errors.companyName ? 'border-red-500' : ''}
                      />
                      {errors.companyName && <div id="companyName-error" className="text-xs text-red-500 mt-1">{errors.companyName}</div>}
                    </div>
                    <div>
                      <Label htmlFor="companyNumber">Company Number</Label>
                      <Input
                        id="companyNumber"
                        name="companyNumber"
                        value={formData.companyNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="clientCode">Client Code</Label>
                      <Input
                        id="clientCode"
                        name="clientCode"
                        value={formData.clientCode}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.clientCode}
                        aria-describedby="clientCode-error"
                        className={errors.clientCode ? 'border-red-500' : ''}
                      />
                      {errors.clientCode && <div id="clientCode-error" className="text-xs text-red-500 mt-1">{errors.clientCode}</div>}
                    </div>
                    <div>
                      <Label htmlFor="emailDomain">Email Domain</Label>
                      <Input
                        id="emailDomain"
                        name="emailDomain"
                        value={formData.emailDomain}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.emailDomain}
                        aria-describedby="emailDomain-error"
                        className={errors.emailDomain ? 'border-red-500' : ''}
                      />
                      {errors.emailDomain && <div id="emailDomain-error" className="text-xs text-red-500 mt-1">{errors.emailDomain}</div>}
                    </div>
                    <div>
                      <Label htmlFor="isActive">Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <span>{formData.isActive ? 'Active' : 'Not Active'}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="carFinanceDomain">Car Finance Domain</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          id="carFinanceDomain"
                          checked={formData.carFinanceDomain}
                          onCheckedChange={checked => setFormData(prev => ({ ...prev, carFinanceDomain: checked }))}
                        />
                        <span>{formData.carFinanceDomain ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="propertyFinanceDomain">Property Finance Domain</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          id="propertyFinanceDomain"
                          checked={formData.propertyFinanceDomain}
                          onCheckedChange={checked => setFormData(prev => ({ ...prev, propertyFinanceDomain: checked }))}
                        />
                        <span>{formData.propertyFinanceDomain ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="smeFinanceDomain">SME Finance Domain</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          id="smeFinanceDomain"
                          checked={formData.smeFinanceDomain}
                          onCheckedChange={checked => setFormData(prev => ({ ...prev, smeFinanceDomain: checked }))}
                        />
                        <span>{formData.smeFinanceDomain ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                      ) : (
                        <PencilIcon className="w-5 h-5 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
} 