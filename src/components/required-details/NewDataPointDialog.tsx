import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { OptionsConfigurator } from './OptionsConfigurator';
import { BranchingRuleConfigurator } from './BranchingRuleConfigurator';
import { DataPointCombobox } from './DataPointCombobox';
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface NewDataPointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSave: (newDataPoint: any) => Promise<void>;
  existingDataPoints: string[];
}

interface JunoDatapoint {
  id: string;
  type?: string;
  category: string;
  questionText: string;
  options?: string[];
  specificParsingRules?: string;
}

export function NewDataPointDialog({ 
  open, 
  onOpenChange, 
  clientId, 
  onSave, 
  existingDataPoints 
}: NewDataPointDialogProps) {
  const [form, setForm] = useState({
    datapoint: '',
    id: '',
    category: '',
    questionText: '',
    prev: '',
    default_value: '',
    default_from_datapoint: '',
    extraction_notes: '',
    invalid_reason: '',
    options: {},
    branchingRule: {},
    next_anyway: '',
    extract_only: false,
    extract_externally: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [junoDatapoints, setJunoDatapoints] = useState<JunoDatapoint[]>([]);

  // Fetch juno datapoints when dialog opens
  useEffect(() => {
    if (open) {
      const fetchJunoDatapoints = async () => {
        try {
          const response = await fetch('/api/juno-datapoints');
          const data = await response.json();
          setJunoDatapoints(data);
        } catch (error) {
          console.error('Failed to fetch juno datapoints:', error);
        }
      };
      fetchJunoDatapoints();
    }
  }, [open]);

  // Compute unique categories from juno datapoints
  const categories = useMemo(() => {
    const cats = junoDatapoints.map(dp => dp.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [junoDatapoints]);

  // Track used datapoints
  const usedDatapoints = useMemo(() => {
    const used = new Map<string, number>();
    existingDataPoints.forEach(id => {
      if (id) {
        used.set(id, (used.get(id) || 0) + 1);
      }
    });
    return used;
  }, [existingDataPoints]);

  // Check if a datapoint is duplicate
  const isDuplicateDatapoint = (id: string | null | undefined) => {
    if (!id) return false;
    return (usedDatapoints.get(id) || 0) > 1;
  };

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.id || !form.category) {
      setError('ID and Category are required');
      return;
    }

    // Check if ID already exists
    if (existingDataPoints.includes(form.id)) {
      setError('A data point with this ID already exists');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        ...form,
        next_anyway: form.next_anyway.split('\n').map((s: string) => s.trim()).filter(Boolean),
      });
      // Reset form
      setForm({
        datapoint: '',
        id: '',
        category: '',
        questionText: '',
        prev: '',
        default_value: '',
        default_from_datapoint: '',
        extraction_notes: '',
        invalid_reason: '',
        options: {},
        branchingRule: {},
        next_anyway: '',
        extract_only: false,
        extract_externally: false,
      });
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || 'Error creating data point');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      datapoint: '',
      id: '',
      category: '',
      questionText: '',
      prev: '',
      default_value: '',
      default_from_datapoint: '',
      extraction_notes: '',
      invalid_reason: '',
      options: {},
      branchingRule: {},
      next_anyway: '',
      extract_only: false,
      extract_externally: false,
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Add New Data Point</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <Label className="block text-xs font-medium mb-1">Datapoint</Label>
              <Input 
                className="w-full" 
                value={form.datapoint} 
                onChange={e => handleChange('datapoint', e.target.value)}
                placeholder="Enter datapoint name"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">ID *</Label>
              <DataPointCombobox
                value={form.id}
                onChange={(value) => handleChange('id', typeof value === 'string' ? value : '')}
                placeholder="Select a datapoint ID"
                dataPoints={junoDatapoints.map(dp => dp.id)}
                currentDatapointId={form.id}
                isDuplicate={isDuplicateDatapoint(form.id)}
                isIdField={true}
                usedDatapoints={usedDatapoints}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Category *</Label>
              <SearchableSelect
                value={form.category}
                onValueChange={(value) => handleChange('category', value)}
                options={categories.map((category) => ({ value: category, label: category }))}
                placeholder="Select category"
                searchPlaceholder="Search categories..."
                allowCustom={true}
                onCustomValueChange={(value) => handleChange('category', value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-xs font-medium mb-1">Question Text</Label>
              <Textarea 
                className="w-full" 
                value={form.questionText} 
                onChange={e => handleChange('questionText', e.target.value)}
                placeholder="Enter question text"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Previous Question</Label>
              <DataPointCombobox
                value={form.prev}
                onChange={(value) => handleChange('prev', typeof value === 'string' ? value : '')}
                placeholder="Select previous data point"
                dataPoints={existingDataPoints}
                currentDatapointId=""
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Default Value</Label>
              <Input 
                className="w-full" 
                value={form.default_value} 
                onChange={e => handleChange('default_value', e.target.value)}
                placeholder="Enter default value"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Default From Datapoint</Label>
              <DataPointCombobox
                value={form.default_from_datapoint}
                onChange={(value) => handleChange('default_from_datapoint', typeof value === 'string' ? value : '')}
                placeholder="Select data point"
                dataPoints={existingDataPoints}
                currentDatapointId=""
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Invalid Reason</Label>
              <Input 
                className="w-full" 
                value={form.invalid_reason} 
                onChange={e => handleChange('invalid_reason', e.target.value)}
                placeholder="Enter invalid reason"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-xs font-medium mb-1">Extraction Notes</Label>
              <Textarea 
                className="w-full" 
                value={form.extraction_notes} 
                onChange={e => handleChange('extraction_notes', e.target.value)}
                placeholder="Enter extraction guidelines"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-xs font-medium mb-1">Options</Label>
              <OptionsConfigurator 
                value={form.options} 
                onChange={opts => handleChange('options', opts)} 
                dataPoints={existingDataPoints} 
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-xs font-medium mb-1">Branching Rule</Label>
              <BranchingRuleConfigurator 
                value={form.branchingRule} 
                onChange={br => handleChange('branchingRule', br)} 
                dataPoints={existingDataPoints} 
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-xs font-medium mb-1">Next Anyway</Label>
              <Textarea 
                className="w-full" 
                value={form.next_anyway} 
                onChange={e => handleChange('next_anyway', e.target.value)} 
                placeholder="One datapoint per line"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="extract_only" 
                checked={form.extract_only} 
                onCheckedChange={v => handleChange('extract_only', v)} 
              />
              <Label htmlFor="extract_only" className="text-xs">Extract Only</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="extract_externally" 
                checked={form.extract_externally} 
                onCheckedChange={v => handleChange('extract_externally', v)} 
              />
              <Label htmlFor="extract_externally" className="text-xs">Extract Externally</Label>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-xs mt-2 px-4">{error}</div>}
        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Creating...' : 'Create Data Point'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 