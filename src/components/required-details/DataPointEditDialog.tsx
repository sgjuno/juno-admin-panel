import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, FileText, GitBranch, ExternalLink, AlertTriangle } from 'lucide-react';
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
      <DialogContent className="max-w-4xl w-full max-h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5" />
            Edit Data Point
            <Badge variant="secondary" className="ml-2">{form.id || 'New'}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Options
            </TabsTrigger>
            <TabsTrigger value="branching" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Branching
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>
          
          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="basic" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identification</CardTitle>
                  <CardDescription>Basic identifiers for this data point</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="datapoint">Datapoint Name</Label>
                      <Input 
                        id="datapoint"
                        value={form.datapoint} 
                        onChange={e => handleChange('datapoint', e.target.value)}
                        placeholder="e.g., companyType"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="id">Unique ID</Label>
                      <Input 
                        id="id"
                        value={form.id} 
                        onChange={e => handleChange('id', e.target.value)}
                        placeholder="e.g., companyType"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question Configuration</CardTitle>
                  <CardDescription>Define how this data point is presented to users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionText">Question Text</Label>
                    <Textarea 
                      id="questionText"
                      value={form.questionText} 
                      onChange={e => handleChange('questionText', e.target.value)}
                      placeholder="What type of company is this: LTD, LLP, Sole Trader or Partnership?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prev">Previous Question</Label>
                    <Input 
                      id="prev"
                      value={form.prev} 
                      onChange={e => handleChange('prev', e.target.value)}
                      placeholder="ID of the previous question"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Default Values</CardTitle>
                  <CardDescription>Configure default behavior and values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default_value">Default Value</Label>
                      <Input 
                        id="default_value"
                        value={form.default_value} 
                        onChange={e => handleChange('default_value', e.target.value)}
                        placeholder="Static default value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default_from_datapoint">Default From Datapoint</Label>
                      <Input 
                        id="default_from_datapoint"
                        value={form.default_from_datapoint} 
                        onChange={e => handleChange('default_from_datapoint', e.target.value)}
                        placeholder="Get default from another datapoint"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="options" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Options Configuration</CardTitle>
                  <CardDescription>Define available options and their routing behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <OptionsConfigurator 
                    value={form.options} 
                    onChange={opts => handleChange('options', opts)} 
                    dataPoints={dataPoints} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branching" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Branching Rules</CardTitle>
                  <CardDescription>Configure conditional logic and routing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BranchingRuleConfigurator 
                    value={form.branchingRule} 
                    onChange={br => handleChange('branchingRule', br)} 
                    dataPoints={dataPoints} 
                  />
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="next_anyway">Next Anyway</Label>
                    <Textarea 
                      id="next_anyway"
                      value={form.next_anyway} 
                      onChange={e => handleChange('next_anyway', e.target.value)} 
                      placeholder="One datapoint per line"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Data points that should always be shown next, regardless of the answer
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extraction Settings</CardTitle>
                  <CardDescription>Configure how data is extracted and processed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="extraction_notes">Extraction Notes</Label>
                    <Textarea 
                      id="extraction_notes"
                      value={form.extraction_notes} 
                      onChange={e => handleChange('extraction_notes', e.target.value)}
                      placeholder="Special instructions for data extraction..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invalid_reason">Invalid Reason</Label>
                    <Input 
                      id="invalid_reason"
                      value={form.invalid_reason} 
                      onChange={e => handleChange('invalid_reason', e.target.value)}
                      placeholder="Reason shown when validation fails"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Processing Options
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3 p-4 border rounded-lg">
                        <Switch 
                          id="extract_only" 
                          checked={form.extract_only} 
                          onCheckedChange={v => handleChange('extract_only', v)} 
                        />
                        <div className="space-y-1">
                          <Label htmlFor="extract_only" className="font-medium">Extract Only</Label>
                          <p className="text-xs text-muted-foreground">
                            Only extract this data, don't ask the user for it
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 border rounded-lg">
                        <Switch 
                          id="extract_externally" 
                          checked={form.extract_externally} 
                          onCheckedChange={v => handleChange('extract_externally', v)} 
                        />
                        <div className="space-y-1">
                          <Label htmlFor="extract_externally" className="font-medium">Extract Externally</Label>
                          <p className="text-xs text-muted-foreground">
                            Use external services for data extraction
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={loading} className="min-w-[100px]">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 