'use client';

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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input as ShadInput } from '@/components/ui/input';

interface DetailRequired {
  datapoint: string;
  id: string;
  prev: string | null;
  questionText?: string;
  options?: string[] | { [key: string]: string[] | string | null };
  branchingRule?: { [key: string]: string[] | string };
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
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder: string;
  dataPoints: string[];
  currentDatapointId: string;
  isDuplicate?: boolean;
  isIdField?: boolean;
  usedDatapoints?: Map<string, number>;
}

function DataPointCombobox({ 
  value, 
  onChange, 
  placeholder, 
  dataPoints, 
  currentDatapointId, 
  isDuplicate,
  isIdField,
  usedDatapoints 
}: DataPointComboboxProps) {
  const [open, setOpen] = useState(false);

  // Support multi-select display for array values
  const isMulti = Array.isArray(value);
  const selectedValues = isMulti ? value : value ? [value] : [];
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
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>No data point found.</CommandEmpty>
            <CommandGroup>
              {availableDataPoints
                .filter(dp => dp !== currentDatapointId)
                .map((datapoint) => (
                  <CommandItem
                    key={datapoint}
                    value={datapoint}
                    onSelect={() => {
                      if (isMulti) {
                        // Toggle selection
                        const exists = selectedValues.includes(datapoint);
                        const newVals = exists
                          ? selectedValues.filter((v) => v !== datapoint)
                          : [...selectedValues, datapoint];
                        onChange(newVals);
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
  type: 'simple' | 'mapping' | 'numeric' | 'complex';
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
  const [configType, setConfigType] = useState<'simple' | 'mapping' | 'numeric' | 'complex'>(
    Array.isArray(value) ? 'simple' : 
    typeof value === 'object' && Object.values(value).some(v => Array.isArray(v)) ? 'mapping' :
    typeof value === 'object' && Object.keys(value).every(k => !isNaN(Number(k))) ? 'numeric' :
    'complex'
  );

  const [simpleOptions, setSimpleOptions] = useState<string[]>(Array.isArray(value) ? value : []);
  const [mappingOptions, setMappingOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );
  const [numericOptions, setNumericOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );
  const [complexOptions, setComplexOptions] = useState<{ [key: string]: string }>(
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

  const handleComplexOptionAdd = () => {
    setComplexOptions({ ...complexOptions, '': '' });
  };

  const handleComplexOptionChange = (key: string, newKey: string, value: string) => {
    const newOptions = { ...complexOptions };
    delete newOptions[key];
    newOptions[newKey] = value;
    setComplexOptions(newOptions);
    onChange(newOptions);
  };

  const handleComplexOptionRemove = (key: string) => {
    const newOptions = { ...complexOptions };
    delete newOptions[key];
    setComplexOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <Tabs value={configType} onValueChange={(v) => setConfigType(v as typeof configType)}>
        <TabsList>
          <TabsTrigger value="simple">Simple Options</TabsTrigger>
          <TabsTrigger value="mapping">Option Mapping</TabsTrigger>
          <TabsTrigger value="numeric">Numeric Branching</TabsTrigger>
          <TabsTrigger value="complex">Complex Mapping</TabsTrigger>
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
                  value={Array.isArray(values) ? values.join(', ') : ''}
                  onChange={(value) => handleMappingOptionChange(key, key, value ? value.split(', ') : [])}
                  placeholder="Select data points"
                  dataPoints={dataPoints}
                  currentDatapointId=""
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
                  value={Array.isArray(values) ? values.join(', ') : ''}
                  onChange={(value) => handleNumericOptionChange(key, key, value ? value.split(', ') : [])}
                  placeholder="Select data points"
                  dataPoints={dataPoints}
                  currentDatapointId=""
                />
              </div>
            </div>
          ))}
          <Button onClick={handleNumericOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Numeric Option
          </Button>
        </TabsContent>

        <TabsContent value="complex" className="space-y-4">
          {Object.entries(complexOptions).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={key}
                  onChange={(e) => handleComplexOptionChange(key, e.target.value, value)}
                  placeholder="Option key"
                />
                <ArrowRight className="w-4 h-4 self-center" />
                <DataPointCombobox
                  value={value}
                  onChange={(newValue) => handleComplexOptionChange(key, key, newValue || '')}
                  placeholder="Select data point"
                  dataPoints={dataPoints}
                  currentDatapointId=""
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleComplexOptionRemove(key)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={handleComplexOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Complex Option
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

function renderSelectedFieldsTable(selectedFields: string[], setSelectedFields: (fields: string[]) => void): JSX.Element | null {
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
              <td className="p-2 break-words whitespace-normal">{field}</td>
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
    setSelectedFields(Array.isArray(values) ? values : values ? [values] : []);
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

export default function RequiredDetailsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<any>(null);
  const [detailsRequired, setDetailsRequired] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [junoDatapoints, setJunoDatapoints] = useState<{ id: string; questionText: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, datapointsRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch('/api/juno-datapoints')
        ]);
        
        const clientData = await clientRes.json();
        const datapointsData = await datapointsRes.json();
        
        setClient(clientData);
        setDetailsRequired(clientData.detailsRequired || []);
        setJunoDatapoints(datapointsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const handleAddCategory = () => {
    if (!newCategory) return;
    setDetailsRequired([...detailsRequired, { category: newCategory, detailRequired: [] }]);
    setNewCategory('');
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

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                className="w-64"
              />
              <Button onClick={handleAddCategory} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </div>
          </div>
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
                                    <Input
                                      value={detail.datapoint}
                                      onChange={(e) => handleDetailChange(categoryIndex, detailIndex, 'datapoint', e.target.value)}
                                      placeholder="e.g., loanAmount"
                                      className="w-full"
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
                      onClick={() => handleAddDetail(categoryIndex)}
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
        </CardContent>
      </Card>
    </div>
  );
} 