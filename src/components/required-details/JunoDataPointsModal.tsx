'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Search, Pencil, Trash2, Check, X, Eye, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface JunoDatapoint {
  _id?: string;
  id: string;
  type: string;
  category: string;
  questionText: string;
  options?: string[];
  specificParsingRules?: string;
  branchingRule?: string;
}

interface JunoDataPointsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDatapoint?: (datapoint: JunoDatapoint) => void;
  selectedDatapoints?: string[];
  clientId: string;
}

export function JunoDataPointsModal({
  open,
  onOpenChange,
  onSelectDatapoint,
  selectedDatapoints = [],
  clientId
}: JunoDataPointsModalProps) {
  const [datapoints, setDatapoints] = useState<JunoDatapoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('__all__');
  const [typeFilter, setTypeFilter] = useState('__all__');
  const [activeTab, setActiveTab] = useState('browse');

  // Add/Edit form state
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<JunoDatapoint | null>(null);
  const [form, setForm] = useState<JunoDatapoint>({
    id: '',
    type: '',
    category: '',
    questionText: '',
    options: [],
    specificParsingRules: '',
    branchingRule: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDatapoints();
    }
  }, [open]);

  const fetchDatapoints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/juno-datapoints');
      if (!res.ok) throw new Error('Failed to fetch datapoints');
      const data = await res.json();
      setDatapoints(data);
    } catch (e) {
      setError('Failed to load datapoints.');
    }
    setLoading(false);
  };

  const categories = useMemo(() =>
    Array.from(new Set(datapoints.map(d => d.category).filter(Boolean))),
    [datapoints]
  );

  const types = useMemo(() =>
    Array.from(new Set(datapoints.map(d => d.type).filter(Boolean))),
    [datapoints]
  );

  const filteredDatapoints = useMemo(() => {
    return datapoints.filter(dp => {
      const matchesSearch =
        !search ||
        dp.id.toLowerCase().includes(search.toLowerCase()) ||
        dp.questionText.toLowerCase().includes(search.toLowerCase()) ||
        (dp.category && dp.category.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === '__all__' || dp.category === categoryFilter;
      const matchesType = typeFilter === '__all__' || dp.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [datapoints, search, categoryFilter, typeFilter]);

  const handleFormChange = (field: keyof JunoDatapoint, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOption = () => {
    setForm(prev => ({ ...prev, options: [...(prev.options || []), ''] }));
  };

  const handleOptionsChange = (idx: number, value: string) => {
    setForm(prev => {
      const options = prev.options ? [...prev.options] : [];
      options[idx] = value;
      return { ...prev, options };
    });
  };

  const handleRemoveOption = (idx: number) => {
    setForm(prev => {
      const options = prev.options ? [...prev.options] : [];
      options.splice(idx, 1);
      return { ...prev, options };
    });
  };

  const openAddMode = () => {
    setEditMode(true);
    setEditing(null);
    setForm({
      id: '',
      type: '',
      category: '',
      questionText: '',
      options: [],
      specificParsingRules: '',
      branchingRule: '',
    });
    setActiveTab('add');
  };

  const openEditMode = (dp: JunoDatapoint) => {
    setEditMode(true);
    setEditing(dp);
    setForm({ ...dp, options: dp.options ? [...dp.options] : [] });
    setActiveTab('add');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditing(null);
    setForm({
      id: '',
      type: '',
      category: '',
      questionText: '',
      options: [],
      specificParsingRules: '',
      branchingRule: '',
    });
    setActiveTab('browse');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/juno-datapoints/${editing._id}` : '/api/juno-datapoints';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess(editing ? 'Updated successfully!' : 'Added successfully!');
      cancelEdit();
      fetchDatapoints();
    } catch (e) {
      setError('Failed to save datapoint.');
    }
    setSaving(false);
  };

  const handleDelete = async (dp: JunoDatapoint) => {
    if (!window.confirm('Are you sure you want to delete this datapoint?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/juno-datapoints/${dp._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setSuccess('Deleted successfully!');
      fetchDatapoints();
    } catch (e) {
      setError('Failed to delete datapoint.');
    }
  };

  const isDatapointUsed = (datapointId: string) => {
    return selectedDatapoints.includes(datapointId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            JunoDataPoints Collection
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="browse">Browse DataPoints</TabsTrigger>
              <TabsTrigger value="add">
                {editMode ? (editing ? 'Edit DataPoint' : 'Add DataPoint') : 'Add DataPoint'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="flex flex-col space-y-4 mt-4 min-h-0 flex-1 overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-4 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by ID, question, or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
                  <SearchableSelect
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                    options={[
                      { value: '__all__', label: 'All Categories' },
                      ...categories.map(cat => ({ value: cat, label: cat }))
                    ]}
                    placeholder="Filter by category"
                    searchPlaceholder="Search categories..."
                    className="w-full sm:w-48"
                  />
                  <SearchableSelect
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                    options={[
                      { value: '__all__', label: 'All Types' },
                      ...types.map(type => ({ value: type, label: type }))
                    ]}
                    placeholder="Filter by type"
                    searchPlaceholder="Search types..."
                    className="w-full sm:w-48"
                  />
                  <Button onClick={openAddMode} size="sm" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1" /> Add New
                  </Button>
                </div>
              </div>

              {success && (
                <Alert className="bg-green-50 border-green-200 flex-shrink-0">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="flex-shrink-0">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex-1 min-h-0 rounded-lg border overflow-hidden">
                <ScrollArea className="h-full">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading datapoints...</div>
                  ) : filteredDatapoints.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No datapoints found. Try adjusting your filters or add a new datapoint.
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto">
                      {/* Desktop Table View */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="sticky top-0 bg-background">ID</TableHead>
                              <TableHead className="sticky top-0 bg-background">Category</TableHead>
                              <TableHead className="sticky top-0 bg-background">Type</TableHead>
                              <TableHead className="sticky top-0 bg-background">Question</TableHead>
                              <TableHead className="sticky top-0 bg-background">Status</TableHead>
                              <TableHead className="sticky top-0 bg-background text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDatapoints.map((dp) => (
                              <TableRow key={dp._id || dp.id} className="hover:bg-muted/50">
                                <TableCell className="font-mono text-sm max-w-[200px]">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="block truncate">{dp.id}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>{dp.id}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs whitespace-nowrap">{dp.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="text-xs whitespace-nowrap">{dp.type}</Badge>
                                </TableCell>
                                <TableCell className="max-w-[300px]">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="block truncate">{dp.questionText}</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">{dp.questionText}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                  {isDatapointUsed(dp.id) ? (
                                    <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap">In Use</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground text-xs whitespace-nowrap">Available</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    {onSelectDatapoint && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          console.log('Desktop: Selecting datapoint:', dp);
                                          onSelectDatapoint?.(dp);
                                          onOpenChange(false);
                                        }}
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditMode(dp)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(dp)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {filteredDatapoints.map((dp) => (
                          <div key={dp._id || dp.id} className="border rounded-lg p-4 space-y-3 bg-card">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="font-mono text-sm font-medium">{dp.id}</div>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">{dp.category}</Badge>
                                  <Badge variant="secondary" className="text-xs">{dp.type}</Badge>
                                </div>
                              </div>
                              <div>
                                {isDatapointUsed(dp.id) ? (
                                  <Badge className="bg-green-100 text-green-700 text-xs">In Use</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground text-xs">Available</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {dp.questionText}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              {onSelectDatapoint && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    console.log('Mobile: Selecting datapoint:', dp);
                                    onSelectDatapoint?.(dp);
                                    onOpenChange(false);
                                  }}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Select
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditMode(dp)}
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(dp)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
          </TabsContent>

            <TabsContent value="add" className="flex flex-col space-y-4 mt-4 min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dp-id">ID *</Label>
                    <Input
                      id="dp-id"
                      value={form.id}
                      onChange={(e) => handleFormChange('id', e.target.value)}
                      placeholder="Enter unique ID"
                      disabled={!!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dp-type">Type *</Label>
                    <SearchableSelect
                      value={form.type}
                      onValueChange={(v) => handleFormChange('type', v)}
                      options={[
                        ...types.map(type => ({ value: type, label: type })),
                        { value: 'other', label: 'Other (Type custom)' }
                      ]}
                      placeholder="Select type"
                      searchPlaceholder="Search types..."
                      allowCustom={true}
                      onCustomValueChange={(v) => handleFormChange('type', v)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dp-category">Category *</Label>
                  <SearchableSelect
                    value={form.category}
                    onValueChange={(v) => handleFormChange('category', v)}
                    options={[
                      ...categories.map(cat => ({ value: cat, label: cat })),
                      { value: 'other', label: 'Other (Type custom)' }
                    ]}
                    placeholder="Select category"
                    searchPlaceholder="Search categories..."
                    allowCustom={true}
                    onCustomValueChange={(v) => handleFormChange('category', v)}
                  />
                </div>

                <div>
                  <Label htmlFor="dp-question">Question Text *</Label>
                  <Textarea
                    id="dp-question"
                    value={form.questionText}
                    onChange={(e) => handleFormChange('questionText', e.target.value)}
                    placeholder="Enter the question text that will be displayed"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="dp-rules">Specific Parsing Rules</Label>
                  <Textarea
                    id="dp-rules"
                    value={form.specificParsingRules || ''}
                    onChange={(e) => handleFormChange('specificParsingRules', e.target.value)}
                    placeholder="Describe any special parsing logic for this datapoint"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Options</Label>
                  <div className="space-y-2 mt-2">
                    {(form.options || []).map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionsChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleAddOption}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Option
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              </ScrollArea>
              
              <Separator className="flex-shrink-0" />

              <div className="flex justify-between flex-shrink-0">
                <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.id || !form.type || !form.category || !form.questionText}
                >
                  {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Add DataPoint')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}