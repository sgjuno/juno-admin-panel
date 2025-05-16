import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { OptionsConfigurator } from './OptionsConfigurator';
import { BranchingRuleConfigurator } from './BranchingRuleConfigurator';

export function DataPointEditDialog({ open, onOpenChange, detail, clientId, onSave, onCancel, dataPoints }: any) {
  const [form, setForm] = useState({
    datapoint: detail?.datapoint || '',
    id: detail?.id || '',
    questionText: detail?.questionText || '',
    prev: detail?.prev || '',
    default_value: detail?.default_value || '',
    default_from_datapoint: detail?.default_from_datapoint || '',
    extraction_notes: detail?.extraction_notes || '',
    invalid_reason: detail?.invalid_reason || '',
    options: detail?.options || {},
    branchingRule: detail?.branchingRule || {},
    next_anyway: detail?.next_anyway?.join('\n') || '',
    extract_only: !!detail?.extract_only,
    extract_externally: !!detail?.extract_externally,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSave({
        ...form,
        next_anyway: form.next_anyway.split('\n').map((s: string) => s.trim()).filter(Boolean),
      });
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || 'Error saving data point');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0">
        <DialogHeader>
          <DialogTitle>Edit Data Point</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-xs font-medium mb-1">Datapoint</label>
              <Input className="w-full" value={form.datapoint} onChange={e => handleChange('datapoint', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">ID</label>
              <Input className="w-full" value={form.id} onChange={e => handleChange('id', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Question Text</label>
              <Textarea className="w-full" value={form.questionText} onChange={e => handleChange('questionText', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Previous Question</label>
              <Input className="w-full" value={form.prev} onChange={e => handleChange('prev', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Default Value</label>
              <Input className="w-full" value={form.default_value} onChange={e => handleChange('default_value', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Default From Datapoint</label>
              <Input className="w-full" value={form.default_from_datapoint} onChange={e => handleChange('default_from_datapoint', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Invalid Reason</label>
              <Input className="w-full" value={form.invalid_reason} onChange={e => handleChange('invalid_reason', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Extraction Notes</label>
              <Textarea className="w-full" value={form.extraction_notes} onChange={e => handleChange('extraction_notes', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Options</label>
              <OptionsConfigurator value={form.options} onChange={opts => handleChange('options', opts)} dataPoints={dataPoints} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Branching Rule</label>
              <BranchingRuleConfigurator value={form.branchingRule} onChange={br => handleChange('branchingRule', br)} dataPoints={dataPoints} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Next Anyway</label>
              <Textarea className="w-full" value={form.next_anyway} onChange={e => handleChange('next_anyway', e.target.value)} placeholder="One datapoint per line" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="extract_only" checked={form.extract_only} onCheckedChange={v => handleChange('extract_only', v)} />
              <label htmlFor="extract_only" className="text-xs">Extract Only</label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="extract_externally" checked={form.extract_externally} onCheckedChange={v => handleChange('extract_externally', v)} />
              <label htmlFor="extract_externally" className="text-xs">Extract Externally</label>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 