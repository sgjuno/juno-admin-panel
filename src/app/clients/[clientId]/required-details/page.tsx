'use client';

import React from 'react';
import { use, useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Check, ChevronsUpDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input as ShadInput } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import DocumentUploader from '@/components/DocumentUploader';

interface DetailRequired {
  datapoint: string;
  id: string;
  prev: string | null;
  questionText?: string;
  options?: Record<string, string[] | string | null>;
  branchingRule?: Record<string, string[] | string>;
  next_anyway?: string[];
  extract_only?: boolean;
  extract_externally?: boolean;
  default_value?: string;
  default_from_datapoint?: string;
  extraction_notes?: string;
  invalid_reason?: string;
}

interface Category {
  category: string;
  detailRequired: DetailRequired[];
}

interface DataPointComboboxProps {
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null) => void;
  placeholder: string;
  dataPoints: string[];
  currentDatapointId: string;
  isDuplicate?: boolean;
  isIdField?: boolean;
  usedDatapoints?: Map<string, number>;
  multi?: boolean;
}

function DataPointCombobox({ 
  value, 
  onChange, 
  placeholder, 
  dataPoints, 
  currentDatapointId, 
  isDuplicate,
  isIdField,
  usedDatapoints,
  multi = false
}: DataPointComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Support multi-select display for array values
  const selectedValues: string[] = Array.isArray(value)
    ? value
    : typeof value === 'string' && value
      ? [value]
      : [];
  const maxVisible = 4;
  const visibleSelections = selectedValues.slice(0, maxVisible);
  const hiddenSelections = selectedValues.slice(maxVisible);

  // Filter out already used datapoints for ID field
  const availableDataPoints = useMemo(() => {
    if (!isIdField || !usedDatapoints) return dataPoints;
    return dataPoints.filter(dp => {
      const usageCount = usedDatapoints.get(dp) || 0;
      if (dp === currentDatapointId) return true;
      return usageCount === 0;
    });
  }, [dataPoints, isIdField, usedDatapoints, currentDatapointId]);

  // Filter by search
  const filteredDataPoints = useMemo(() => {
    if (!search) return availableDataPoints;
    return availableDataPoints.filter(dp => dp.toLowerCase().includes(search.toLowerCase()));
  }, [availableDataPoints, search]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-h-[40px] flex flex-wrap items-center text-left",
              isDuplicate && "border-yellow-500"
            )}
          >
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto w-full">
              {visibleSelections.length > 0 ? (
                visibleSelections.map((val, idx) => (
                  <span key={val + idx} className="bg-muted px-2 py-0.5 rounded text-xs break-words whitespace-normal max-w-[120px] truncate">
                    {val}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              {hiddenSelections.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="bg-muted px-2 py-0.5 rounded text-xs cursor-pointer">+{hiddenSelections.length} more</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs break-words whitespace-normal">
                      {hiddenSelections.join(', ')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-72 overflow-y-auto min-w-[220px]">
          <Command>
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={search}
              onValueChange={setSearch}
              className="sticky top-0 z-10 bg-background"
            />
            <CommandEmpty>No data point found.</CommandEmpty>
            <CommandGroup>
              {filteredDataPoints.map((datapoint) => (
                <CommandItem
                  key={datapoint}
                  value={datapoint}
                  onSelect={() => {
                    if (multi) {
                      if (selectedValues.includes(datapoint)) {
                        // Remove
                        const newVals = selectedValues.filter((v) => v !== datapoint);
                        onChange(newVals);
                      } else {
                        onChange([...selectedValues, datapoint]);
                      }
                    } else {
                      onChange(datapoint);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(datapoint) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {datapoint}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {isDuplicate && (
        <Badge variant="destructive" className="absolute -top-2 -right-2">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Duplicate
        </Badge>
      )}
    </div>
  );
}

interface OptionConfig {
  type: 'simple' | 'mapping' | 'numeric';
  options: string[] | { [key: string]: string[] | string | null };
}

interface BranchingRuleConfig {
  type: 'conditional' | 'single' | 'pattern';
  rules: { [key: string]: string[] | string };
}

function OptionsConfigurator({ 
  value, 
  onChange, 
  dataPoints 
}: { 
  value: any, 
  onChange: (value: any) => void,
  dataPoints: string[]
}) {
  const [configType, setConfigType] = useState<'simple' | 'mapping' | 'numeric'>(
    Array.isArray(value) ? 'simple' : 
    typeof value === 'object' && Object.values(value).some(v => Array.isArray(v)) ? 'mapping' :
    'numeric'
  );

  const [simpleOptions, setSimpleOptions] = useState<string[]>(Array.isArray(value) ? value : []);
  const [mappingOptions, setMappingOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );
  const [numericOptions, setNumericOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );

  const handleSimpleOptionAdd = () => {
    setSimpleOptions([...simpleOptions, '']);
  };

  const handleSimpleOptionChange = (index: number, newValue: string) => {
    const newOptions = [...simpleOptions];
    newOptions[index] = newValue;
    setSimpleOptions(newOptions);
    onChange(newOptions);
  };

  const handleSimpleOptionRemove = (index: number) => {
    const newOptions = simpleOptions.filter((_, i) => i !== index);
    setSimpleOptions(newOptions);
    onChange(newOptions);
  };

  const handleMappingOptionAdd = () => {
    setMappingOptions({ ...mappingOptions, '': [] });
  };

  const handleMappingOptionChange = (key: string, newKey: string, values: string[]) => {
    const newOptions = { ...mappingOptions };
    delete newOptions[key];
    newOptions[newKey] = values;
    setMappingOptions(newOptions);
    onChange(newOptions);
  };

  const handleMappingOptionRemove = (key: string) => {
    const newOptions = { ...mappingOptions };
    delete newOptions[key];
    setMappingOptions(newOptions);
    onChange(newOptions);
  };

  const handleNumericOptionAdd = () => {
    setNumericOptions({ ...numericOptions, '': [] });
  };

  const handleNumericOptionChange = (key: string, newKey: string, values: string[]) => {
    const newOptions = { ...numericOptions };
    delete newOptions[key];
    newOptions[newKey] = values;
    setNumericOptions(newOptions);
    onChange(newOptions);
  };

  const handleNumericOptionRemove = (key: string) => {
    const newOptions = { ...numericOptions };
    delete newOptions[key];
    setNumericOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <Tabs value={configType} onValueChange={(v) => setConfigType(v as typeof configType)}>
        <TabsList>
          <TabsTrigger value="simple">Simple Options</TabsTrigger>
          <TabsTrigger value="mapping">Option Mapping</TabsTrigger>
          <TabsTrigger value="numeric">Numeric Branching</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-4">
          {simpleOptions.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => handleSimpleOptionChange(index, e.target.value)}
                placeholder="Enter option"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSimpleOptionRemove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleSimpleOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Option
          </Button>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          {Object.entries(mappingOptions).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={key}
                  onChange={(e) => handleMappingOptionChange(key, e.target.value, values)}
                  placeholder="Option key"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMappingOptionRemove(key)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="pl-4 space-y-2">
                <Label className="text-sm text-muted-foreground">Next Data Points:</Label>
                <DataPointCombobox
                  value={Array.isArray(values) ? values : typeof values === 'string' && values ? [values] : []}
                  onChange={(value) =>
                    handleMappingOptionChange(
                      key,
                      key,
                      Array.isArray(value)
                        ? value
                        : typeof value === 'string' && value
                        ? value.split(', ')
                        : []
                    )
                  }
                  placeholder="Select data points"
                  dataPoints={dataPoints}
                  currentDatapointId=""
                  multi={true}
                />
              </div>
            </div>
          ))}
          <Button onClick={handleMappingOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Option Mapping
          </Button>
        </TabsContent>

        <TabsContent value="numeric" className="space-y-4">
          {Object.entries(numericOptions).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={key}
                  onChange={(e) => handleNumericOptionChange(key, e.target.value, values)}
                  placeholder="Number"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleNumericOptionRemove(key)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="pl-4 space-y-2">
                <Label className="text-sm text-muted-foreground">Next Data Points:</Label>
                <DataPointCombobox
                  value={Array.isArray(values) ? values : typeof values === 'string' && values ? [values] : []}
                  onChange={(value) =>
                    handleNumericOptionChange(
                      key,
                      key,
                      Array.isArray(value)
                        ? value
                        : typeof value === 'string' && value
                        ? value.split(', ')
                        : []
                    )
                  }
                  placeholder="Select data points"
                  dataPoints={dataPoints}
                  currentDatapointId=""
                  multi={true}
                />
              </div>
            </div>
          ))}
          <Button onClick={handleNumericOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Numeric Option
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderSelectedFields(valueArray: string[]) {
  return (
    <>
      {valueArray.length > 0 && valueArray.slice(0, 4).map((val: string, idx: number) => (
        <span key={val + idx} className="bg-muted px-2 py-0.5 rounded text-xs break-words whitespace-normal max-w-[120px] truncate">
          {val}
        </span>
      ))}
      {valueArray.length > 4 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="bg-muted px-2 py-0.5 rounded text-xs cursor-pointer">+{valueArray.length - 4} more</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs break-words whitespace-normal">
              {valueArray.slice(4).join(', ')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}

function renderSelectedFieldsTable(selectedFields: string[], setSelectedFields: (fields: string[]) => void): React.ReactElement | null {
  if (selectedFields.length === 0) return null;
  return (
    <div className="mb-2">
      <table className="w-full text-sm border rounded">
        <thead>
          <tr className="bg-muted text-left">
            <th className="p-2 font-semibold">Selected Field</th>
            <th className="p-2 font-semibold w-12">Remove</th>
          </tr>
        </thead>
        <tbody>
          {selectedFields.map((field: string) => (
            <tr key={field} className="border-b last:border-b-0">
              <td className="p-2 break-words whitespace-normal max-w-[180px] truncate">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block truncate">{field}</span>
                    </TooltipTrigger>
                    <TooltipContent>{field}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
              <td className="p-2 text-center">
                <button
                  type="button"
                  aria-label={`Remove ${field}`}
                  className="text-xs text-white bg-destructive rounded-full w-6 h-6 flex items-center justify-center hover:bg-destructive/80"
                  onClick={() => setSelectedFields(selectedFields.filter(f => f !== field))}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BranchingRuleConfigurator({
  value,
  onChange,
  dataPoints
}: {
  value: any,
  onChange: (value: any) => void,
  dataPoints: string[]
}) {
  const [rules, setRules] = useState<{ [key: string]: string[] | string }>(
    typeof value === 'object' ? value : {}
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Prevent duplicate fields
  const allSelected = Object.values(rules).flatMap(v => Array.isArray(v) ? v : [v]);

  const handleAddRule = () => {
    setRules({ ...rules, '': [] });
  };

  const handleRuleChange = (key: string, newKey: string, values: string[] | string) => {
    const newRules = { ...rules };
    delete newRules[key];
    newRules[newKey] = values;
    setRules(newRules);
    onChange(newRules);
  };

  const handleRuleRemove = (key: string) => {
    const newRules = { ...rules };
    delete newRules[key];
    setRules(newRules);
    onChange(newRules);
  };

  // Open dialog for a specific rule key
  const openFieldDialog = (key: string, values: string[] | string) => {
    setCurrentKey(key);
    setSelectedFields(Array.isArray(values) ? values : typeof values === 'string' && values ? [values] : []);
    setDialogOpen(true);
  };

  // Save selected fields to rule
  const saveSelectedFields = () => {
    if (currentKey) {
      handleRuleChange(currentKey, currentKey, selectedFields);
    }
    setDialogOpen(false);
  };

  const filteredDataPoints = useMemo(() => {
    if (!searchTerm) return dataPoints;
    return dataPoints.filter(dp => dp.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [dataPoints, searchTerm]);

  return (
    <div className="space-y-4">
      {Object.entries(rules).map(([key, values]) => {
        // Type guard for array values
        const valueArray: string[] = Array.isArray(values) ? values : typeof values === 'string' && values ? [values] : [];
        return (
          <div key={key} className="space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                value={key}
                onChange={(e) => handleRuleChange(key, e.target.value, values)}
                placeholder="Condition"
              />
              <ArrowRight className="w-4 h-4 self-center" />
              <Dialog open={dialogOpen && currentKey === key} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => openFieldDialog(key, values)}>
                    Select fields
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Fields</DialogTitle>
                  </DialogHeader>
                  {renderSelectedFieldsTable(selectedFields, setSelectedFields)}
                  <Separator className="mb-2" />
                  <ShadInput
                    placeholder="Search fields..."
                    className="mb-2"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {filteredDataPoints.map((dp: string) => (
                      <label key={dp} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(dp)}
                          onChange={() => {
                            if (selectedFields.includes(dp)) {
                              setSelectedFields(selectedFields.filter(f => f !== dp));
                            } else {
                              setSelectedFields([...selectedFields, dp]);
                            }
                          }}
                          disabled={allSelected.includes(dp) && !selectedFields.includes(dp)}
                        />
                        <span className="text-sm break-words whitespace-normal">{dp}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveSelectedFields}>
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRuleRemove(key)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
      <Button onClick={handleAddRule} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Rule
      </Button>
    </div>
  );
}

interface JunoDatapoint {
  id: string;
  type?: string;
  category: string;
  questionText: string;
  options?: string[];
  specificParsingRules?: string;
}

export default function RequiredDetailsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const [client, setClient] = useState<any>(null);
  const [detailsRequired, setDetailsRequired] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [junoDatapoints, setJunoDatapoints] = useState<JunoDatapoint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [initialDetailsRequired, setInitialDetailsRequired] = useState<Category[]>([]);
  const [addDetailDialogOpen, setAddDetailDialogOpen] = useState<number | null>(null);
  const [selectedDetailDatapoints, setSelectedDetailDatapoints] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);
  const [showCopyConfig, setShowCopyConfig] = useState(false);
  const [selectedSourceClient, setSelectedSourceClient] = useState('');
  const [existingClients, setExistingClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, datapointsRes, clientsRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch('/api/juno-datapoints'),
          fetch('/api/clients')
        ]);
        
        const clientData = await clientRes.json();
        const datapointsData = await datapointsRes.json();
        const clientsData = await clientsRes.json();
        
        setClient(clientData);
        setDetailsRequired(clientData.detailsRequired || []);
        setInitialDetailsRequired(clientData.detailsRequired || []);
        setJunoDatapoints(datapointsData);
        setExistingClients(clientsData.filter((c: any) => c._id !== clientId));
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const handleAddCategory = () => {
    let categoryToAdd = newCategory;
    if (!detailsRequired.length && !showCustomCategory) {
      categoryToAdd = selectedCategory;
    }
    if (!categoryToAdd) return;
    setDetailsRequired([...detailsRequired, { category: categoryToAdd, detailRequired: [] }]);
    setNewCategory('');
    setSelectedCategory('');
    setShowCustomCategory(false);
  };

  const handleRemoveCategory = (index: number) => {
    setDetailsRequired(detailsRequired.filter((_, i) => i !== index));
  };

  const handleAddDetail = (categoryIndex: number) => {
    const newDetail: DetailRequired = {
      datapoint: '',
      id: '',
      prev: null,
      questionText: '',
    };
    setDetailsRequired(detailsRequired.map((cat, i) => 
      i === categoryIndex 
        ? { ...cat, detailRequired: [...cat.detailRequired, newDetail] }
        : cat
    ));
  };

  const handleRemoveDetail = (categoryIndex: number, detailIndex: number) => {
    setDetailsRequired(detailsRequired.map((cat, i) => 
      i === categoryIndex 
        ? { ...cat, detailRequired: cat.detailRequired.filter((_, j) => j !== detailIndex) }
        : cat
    ));
  };

  const handleDetailChange = (
    categoryIndex: number,
    detailIndex: number,
    field: keyof DetailRequired,
    value: any
  ) => {
    setDetailsRequired(detailsRequired.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat,
            detailRequired: cat.detailRequired.map((detail, j) => 
              j === detailIndex 
                ? { ...detail, [field]: value }
                : detail
            )
          }
        : cat
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detailsRequired }),
    });
    if (res.ok) {
      setSuccess('Saved successfully!');
    } else {
      setError('Failed to save.');
    }
    setSaving(false);
  };

  // Track used datapoints
  const usedDatapoints = useMemo(() => {
    const used = new Map<string, number>();
    detailsRequired.forEach(category => {
      category.detailRequired.forEach(detail => {
        if (detail.id) {
          used.set(detail.id, (used.get(detail.id) || 0) + 1);
        }
      });
    });
    return used;
  }, [detailsRequired]);

  // Check if a datapoint is duplicate
  const isDuplicateDatapoint = (id: string | null | undefined) => {
    if (!id) return false;
    return (usedDatapoints.get(id) || 0) > 1;
  };

  const uniqueCategories = useMemo(() => {
    const cats = junoDatapoints.map(dp => dp.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [junoDatapoints]);

  const isDirty = useMemo(() => {
    return JSON.stringify(detailsRequired) !== JSON.stringify(initialDetailsRequired);
  }, [detailsRequired, initialDetailsRequired]);

  const handleConfigExtracted = (config: any) => {
    if (config.detailsRequired && config.detailsRequired.length > 0) {
      setDetailsRequired(config.detailsRequired);
      setSuccess('Configuration extracted successfully!');
    } else {
      setError('No required details were extracted from the document. Please check the document or try another file.');
    }
    setShowDocumentUploader(false);
  };

  const handleCopyConfig = async (sourceClientId: string) => {
    try {
      const res = await fetch(`/api/clients/${sourceClientId}`);
      const sourceClient = await res.json();
      if (sourceClient.detailsRequired) {
        setDetailsRequired(sourceClient.detailsRequired);
        setSuccess('Configuration copied successfully!');
      }
    } catch (err) {
      setError('Failed to copy configuration');
    }
    setShowCopyConfig(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
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
        <AlertDescription>Client not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Required Details for {client.companyName}</h1>
          <p className="text-muted-foreground">
            Configure the details required from clients during the application process
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDocumentUploader(!showDocumentUploader)}
          >
            {showDocumentUploader ? 'Hide Document Upload' : 'Upload Configuration Document'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCopyConfig(!showCopyConfig)}
          >
            {showCopyConfig ? 'Hide Copy Configuration' : 'Copy Configuration from Existing Client'}
          </Button>
          <Button onClick={handleSave} disabled={saving || !isDirty} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
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

      {showDocumentUploader && (
        <DocumentUploader onConfigExtracted={handleConfigExtracted} clientId={clientId} />
      )}

      {showCopyConfig && (
        <div className="space-y-4">
          <Select
            value={selectedSourceClient || ''}
            onValueChange={handleCopyConfig}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client to copy from" />
            </SelectTrigger>
            <SelectContent>
              {existingClients.map((client) => (
                <SelectItem key={client._id} value={client._id}>
                  {client.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <div className="flex gap-2">
              {detailsRequired.length === 0 ? (
                <>
                  <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-64 justify-between">
                        {selectedCategory || 'Select category'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <Command>
                        <CommandInput placeholder="Search categories..." value={categorySearch} onValueChange={setCategorySearch} />
                        <CommandList className="max-h-60 overflow-y-auto">
                          {uniqueCategories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                            <CommandItem key={cat} value={cat} onSelect={() => {
                              setSelectedCategory(cat);
                              setShowCustomCategory(false);
                              setCategoryPopoverOpen(false);
                              setCategorySearch('');
                            }}>
                              {cat}
                            </CommandItem>
                          ))}
                          <CommandItem value="__other__" onSelect={() => {
                            setShowCustomCategory(true);
                            setSelectedCategory('');
                            setCategoryPopoverOpen(false);
                            setCategorySearch('');
                          }}>
                            Other (Add new)
                          </CommandItem>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {showCustomCategory && (
                    <Input
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                      className="w-64"
                    />
                  )}
                  <Button onClick={handleAddCategory} variant="outline" className="gap-2" disabled={(!selectedCategory && !newCategory)}>
                    <Plus className="w-4 h-4" /> Add Category
                  </Button>
                </>
              ) : (
                <>
                  <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-64 justify-between">
                        {newCategory || 'New category name'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <Command>
                        <CommandInput placeholder="Search categories..." value={categorySearch} onValueChange={setCategorySearch} />
                        <CommandList className="max-h-60 overflow-y-auto">
                          {uniqueCategories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                            <CommandItem key={cat} value={cat} onSelect={() => {
                              setNewCategory(cat);
                              setCategoryPopoverOpen(false);
                              setCategorySearch('');
                            }}>
                              {cat}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button onClick={handleAddCategory} variant="outline" className="gap-2" disabled={!newCategory}>
                    <Plus className="w-4 h-4" /> Add Category
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">You must click <b>Save Changes</b> to persist added/removed categories or details.</div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-4 w-full">
            {detailsRequired.map((category, categoryIndex) => (
              <AccordionItem key={categoryIndex} value={`category-${categoryIndex}`} className="w-full">
                <div className="flex items-center justify-between w-full">
                  <AccordionTrigger className="flex-1">
                    <span className="text-lg font-semibold break-words whitespace-normal">{category.category}</span>
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCategory(categoryIndex)}
                    className="mr-2"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <AccordionContent className="w-full max-w-full overflow-x-auto min-w-0">
                  <div className="space-y-4 pt-4 w-full max-w-full min-w-0">
                    {/* Nested accordion for details */}
                    <Accordion type="multiple" className="space-y-2 w-full">
                      {category.detailRequired.map((detail, detailIndex) => (
                        <AccordionItem key={detailIndex} value={`detail-${categoryIndex}-${detailIndex}`} className="w-full">
                          <div className="flex items-center justify-between w-full">
                            <AccordionTrigger className="flex-1 min-w-0">
                              <span className="text-base font-medium break-words whitespace-normal">
                                {detail.datapoint || detail.questionText || `Detail ${detailIndex + 1}`}
                              </span>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="w-full">
                            <Card className="p-4 w-full min-w-0">
                              <div className="space-y-4 min-w-0">
                                {/* All detail configuration fields as before */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
                                  <div className="space-y-2 w-full min-w-0">
                                    <Label className="break-words whitespace-normal">Datapoint</Label>
                                    <DataPointCombobox
                                      value={detail.datapoint}
                                      onChange={(value) => handleDetailChange(categoryIndex, detailIndex, 'datapoint', value)}
                                      placeholder="Select datapoints"
                                      dataPoints={junoDatapoints.map(dp => dp.id)}
                                      currentDatapointId={detail.id}
                                      isDuplicate={isDuplicateDatapoint(detail.id)}
                                      isIdField={false}
                                      usedDatapoints={usedDatapoints}
                                      multi={true}
                                    />
                                  </div>
                                  <div className="space-y-2 w-full min-w-0">
                                    <Label className="break-words whitespace-normal">ID</Label>
                                    <DataPointCombobox
                                      value={detail.id}
                                      onChange={(value) => handleDetailChange(categoryIndex, detailIndex, 'id', value)}
                                      placeholder="Select a datapoint ID"
                                      dataPoints={junoDatapoints.map(dp => dp.id)}
                                      currentDatapointId={detail.id}
                                      isDuplicate={isDuplicateDatapoint(detail.id)}
                                      isIdField={true}
                                      usedDatapoints={usedDatapoints}
                                      multi={false}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2 w-full min-w-0">
                                  <Label className="break-words whitespace-normal">Question Text</Label>
                                  <Textarea
                                    value={detail.questionText || ''}
                                    onChange={(e) => handleDetailChange(categoryIndex, detailIndex, 'questionText', e.target.value)}
                                    placeholder="What is the loan amount required?"
                                    className="w-full"
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
                                  <div className="space-y-2 w-full min-w-0">
                                    <Label className="break-words whitespace-normal">Previous Question</Label>
                                    <DataPointCombobox
                                      value={detail.prev}
                                      onChange={(value) => handleDetailChange(categoryIndex, detailIndex, 'prev', value)}
                                      placeholder="Select previous question"
                                      dataPoints={junoDatapoints.map(dp => dp.id)}
                                      currentDatapointId={detail.id}
                                      isDuplicate={isDuplicateDatapoint(detail.prev)}
                                      isIdField={true}
                                      usedDatapoints={usedDatapoints}
                                      multi={false}
                                    />
                                  </div>
                                  <div className="space-y-2 w-full min-w-0">
                                    <Label className="break-words whitespace-normal">Default Value</Label>
                                    <Input
                                      value={detail.default_value || ''}
                                      onChange={(e) => handleDetailChange(categoryIndex, detailIndex, 'default_value', e.target.value)}
                                      placeholder="e.g., personal (assumed)"
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
                                  <div className="space-y-2 w-full min-w-0">
                                    <Label className="break-words whitespace-normal">Default From Datapoint</Label>
                                    <DataPointCombobox
                                      value={detail.default_from_datapoint}
                                      onChange={(value) => handleDetailChange(categoryIndex, detailIndex, 'default_from_datapoint', value)}
                                      placeholder="Select datapoint"
                                      dataPoints={junoDatapoints.map(dp => dp.id)}
                                      currentDatapointId={detail.id}
                                      isDuplicate={isDuplicateDatapoint(detail.default_from_datapoint)}
                                      isIdField={true}
                                      usedDatapoints={usedDatapoints}
                                      multi={false}
                                    />
                                  </div>
                                  <div className="space-y-2 w-full min-w-0">
                                    <Label className="break-words whitespace-normal">Invalid Reason</Label>
                                    <Input
                                      value={detail.invalid_reason || ''}
                                      onChange={(e) => handleDetailChange(categoryIndex, detailIndex, 'invalid_reason', e.target.value)}
                                      placeholder="e.g., Value must be positive"
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2 w-full min-w-0">
                                  <Label className="break-words whitespace-normal">Extraction Notes</Label>
                                  <Textarea
                                    value={detail.extraction_notes || ''}
                                    onChange={(e) => handleDetailChange(categoryIndex, detailIndex, 'extraction_notes', e.target.value)}
                                    placeholder="Guidelines for extracting this data point"
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2 w-full min-w-0">
                                  <Label className="break-words whitespace-normal">Options</Label>
                                  <OptionsConfigurator
                                    value={detail.options}
                                    onChange={(value) => handleDetailChange(categoryIndex, detailIndex, 'options', value)}
                                    dataPoints={junoDatapoints.map(dp => dp.id)}
                                  />
                                </div>
                                <div className="space-y-2 w-full min-w-0">
                                  <Label className="break-words whitespace-normal">Branching Rule</Label>
                                  <BranchingRuleConfigurator
                                    value={detail.branchingRule}
                                    onChange={(value) => handleDetailChange(categoryIndex, detailIndex, 'branchingRule', value)}
                                    dataPoints={junoDatapoints.map(dp => dp.id)}
                                  />
                                </div>
                                <div className="space-y-2 w-full min-w-0">
                                  <Label className="break-words whitespace-normal">Next Anyway</Label>
                                  <Textarea
                                    value={Array.isArray(detail.next_anyway) ? detail.next_anyway.join('\n') : ''}
                                    onChange={(e) => handleDetailChange(categoryIndex, detailIndex, 'next_anyway', e.target.value.split('\n').filter(Boolean))}
                                    placeholder="One datapoint per line"
                                    className="w-full"
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-w-0">
                                  <div className="flex items-center space-x-2 w-full min-w-0">
                                    <Switch
                                      id={`extract-only-${categoryIndex}-${detailIndex}`}
                                      checked={detail.extract_only || false}
                                      onCheckedChange={(checked) => handleDetailChange(categoryIndex, detailIndex, 'extract_only', checked)}
                                    />
                                    <Label htmlFor={`extract-only-${categoryIndex}-${detailIndex}`}>Extract Only</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 w-full min-w-0">
                                    <Switch
                                      id={`extract-externally-${categoryIndex}-${detailIndex}`}
                                      checked={detail.extract_externally || false}
                                      onCheckedChange={(checked) => handleDetailChange(categoryIndex, detailIndex, 'extract_externally', checked)}
                                    />
                                    <Label htmlFor={`extract-externally-${categoryIndex}-${detailIndex}`}>Extract Externally</Label>
                                  </div>
                                </div>
                                <div className="flex justify-end w-full min-w-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveDetail(categoryIndex, detailIndex)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <Button
                      onClick={() => {
                        setAddDetailDialogOpen(categoryIndex);
                        setSelectedDetailDatapoints([]);
                      }}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Detail
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {/* Add Detail Dialog */}
          <Dialog open={addDetailDialogOpen !== null} onOpenChange={open => { if (!open) setAddDetailDialogOpen(null); }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select Data Points to Add</DialogTitle>
              </DialogHeader>
              {addDetailDialogOpen !== null && (
                <DataPointCombobox
                  value={selectedDetailDatapoints}
                  onChange={val => {
                    if (val == null) setSelectedDetailDatapoints([]);
                    else if (Array.isArray(val)) setSelectedDetailDatapoints(val);
                    else setSelectedDetailDatapoints([val]);
                  }}
                  placeholder="Select data points"
                  dataPoints={junoDatapoints.map(dp => dp.id)}
                  currentDatapointId={''}
                  multi={true}
                />
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setAddDetailDialogOpen(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (addDetailDialogOpen !== null && selectedDetailDatapoints.length > 0) {
                      setDetailsRequired(detailsRequired.map((cat, i) =>
                        i === addDetailDialogOpen
                          ? {
                              ...cat,
                              detailRequired: [
                                ...cat.detailRequired,
                                ...selectedDetailDatapoints.map(dpId => ({
                                  datapoint: dpId,
                                  id: dpId,
                                  prev: null,
                                  questionText: junoDatapoints.find(dp => dp.id === dpId)?.questionText || '',
                                }))
                              ]
                            }
                          : cat
                      ));
                      setAddDetailDialogOpen(null);
                      setSelectedDetailDatapoints([]);
                    }
                  }}
                  disabled={selectedDetailDatapoints.length === 0}
                >
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
} 