'use client';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const VARIABLES = [
  { label: 'Client Name', value: '${clientName}' },
  { label: 'POC Name', value: '${pocName}' },
  { label: 'Company Name', value: '${companyName}' },
  // Add more as needed
];

export default function IrrelevancyHandlingPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [irrelevancyConfig, setIrrelevancyConfig] = useState<any>({
    isActive: false,
    customMessage: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState<any>({
    keywords: [],
    threshold: 0.5,
  });
  const [showSource, setShowSource] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [sourceValue, setSourceValue] = useState('');

  // Rich text editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Enter a custom message for irrelevant enquiries...' })
    ],
    content: irrelevancyConfig.customMessage,
    onUpdate: ({ editor }) => {
      setIrrelevancyConfig((prev: any) => ({ ...prev, customMessage: editor.getHTML() }));
    },
    editable: true,
  });

  // Insert variable at cursor
  function insertVariable(variable: string) {
    if (editor) {
      editor.chain().focus().insertContent(variable).run();
    }
  }

  // Render preview with sample data
  function renderPreview() {
    let html = irrelevancyConfig.customMessage || '';
    html = html.replace(/\$\{clientName\}/g, client?.companyName || 'Acme Corp');
    html = html.replace(/\$\{pocName\}/g, client?.pocName || 'Jane Doe');
    html = html.replace(/\$\{companyName\}/g, client?.companyName || 'Acme Corp');
    return <div className="border rounded-lg p-4 bg-muted" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Formatting actions
  const formatAction = useCallback((action: string) => {
    if (!editor) return;
    switch (action) {
      case 'bold': editor.chain().focus().toggleBold().run(); break;
      case 'italic': editor.chain().focus().toggleItalic().run(); break;
      case 'heading': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'ul': editor.chain().focus().toggleBulletList().run(); break;
      case 'ol': editor.chain().focus().toggleOrderedList().run(); break;
      case 'undo': editor.chain().focus().undo().run(); break;
      case 'redo': editor.chain().focus().redo().run(); break;
    }
  }, [editor]);

  useEffect(() => {
    async function fetchClient() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const data = await res.json();
        setClient(data);
        setIrrelevancyConfig(data.irrelevancyConfig || { isActive: false, customMessage: '' });
        setRules(data.irrelevancyConfig?.rules || []);
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
    setVersionHistory((prev: any[]) => [
      { value: irrelevancyConfig.customMessage, timestamp: new Date().toISOString() },
      ...prev
    ]);
    setTimeout(() => {
      setSaving(false);
      setSuccess('Saved successfully!');
    }, 1000);
  }

  function openAddRule() {
    setEditingRule(null);
    setRuleForm({ keywords: [], threshold: 0.5 });
    setRuleDialogOpen(true);
  }
  function openEditRule(rule: any, idx: number) {
    setEditingRule({ ...rule, idx });
    setRuleForm({ keywords: rule.keywords || [], threshold: rule.threshold ?? 0.5 });
    setRuleDialogOpen(true);
  }
  function handleRuleFormChange(field: string, value: any) {
    setRuleForm((prev: any) => ({ ...prev, [field]: value }));
  }
  function addKeyword(keyword: string) {
    if (keyword && !ruleForm.keywords.includes(keyword)) {
      setRuleForm((prev: any) => ({ ...prev, keywords: [...prev.keywords, keyword] }));
    }
  }
  function removeKeyword(idx: number) {
    setRuleForm((prev: any) => ({ ...prev, keywords: prev.keywords.filter((_: any, i: number) => i !== idx) }));
  }
  function saveRule() {
    if (editingRule) {
      // Edit existing
      setRules(rules.map((r, i) => (i === editingRule.idx ? { ...ruleForm } : r)));
    } else {
      // Add new
      setRules([...rules, { ...ruleForm }]);
    }
    setRuleDialogOpen(false);
  }
  function deleteRule(idx: number) {
    setRules(rules.filter((_, i) => i !== idx));
  }

  function revertVersion(idx: number) {
    const version = versionHistory[idx];
    if (version) {
      setIrrelevancyConfig((prev: any) => ({ ...prev, customMessage: version.value }));
      if (editor) editor.commands.setContent(version.value);
    }
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
          <h1 className="text-2xl font-bold">Irrelevancy Handling for {client.companyName}</h1>
          <p className="text-muted-foreground">Configure how irrelevant enquiries are handled for this client</p>
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
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Irrelevancy Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Enable Irrelevancy Handling</span>
            <Switch 
              checked={irrelevancyConfig.isActive} 
              onCheckedChange={checked => setIrrelevancyConfig({ ...irrelevancyConfig, isActive: checked })} 
            />
          </div>
          <div className="space-y-2">
            <label className="font-semibold">Default Irrelevant Case Response</label>
            <div className="flex items-center gap-2 mb-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">Insert Variable</Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex flex-col gap-2">
                    {VARIABLES.map(v => (
                      <Button key={v.value} variant="ghost" size="sm" onClick={() => insertVariable(v.value)}>
                        {v.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="secondary" size="sm" onClick={() => setShowPreview(p => !p)}>
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
              <div className="flex items-center gap-1 ml-2">
                <Switch checked={showSource} onCheckedChange={setShowSource} aria-label="Toggle Source Mode" />
                <span className="text-xs text-muted-foreground">HTML</span>
              </div>
            </div>
            {/* Formatting Toolbar */}
            {!showSource && (
              <div className="flex gap-2 mb-2">
                <Button type="button" size="icon" variant="ghost" aria-label="Bold" onClick={() => formatAction('bold')}><b>B</b></Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Italic" onClick={() => formatAction('italic')}><i>I</i></Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Heading" onClick={() => formatAction('heading')}>H2</Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Bullet List" onClick={() => formatAction('ul')}>• List</Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Ordered List" onClick={() => formatAction('ol')}>1. List</Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Undo" onClick={() => formatAction('undo')}>↺</Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Redo" onClick={() => formatAction('redo')}>↻</Button>
              </div>
            )}
            {/* Editor/Source Toggle */}
            <div className="border rounded-lg">
              {showSource ? (
                <textarea
                  className="w-full min-h-[120px] p-2 bg-background font-mono text-xs"
                  value={sourceValue || irrelevancyConfig.customMessage}
                  onChange={e => {
                    setSourceValue(e.target.value);
                    setIrrelevancyConfig((prev: any) => ({ ...prev, customMessage: e.target.value }));
                    if (editor) editor.commands.setContent(e.target.value);
                  }}
                />
              ) : (
                <EditorContent editor={editor} className="min-h-[120px] p-2 bg-background" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Available variables:</span>
              {VARIABLES.map(v => (
                <Badge key={v.value} variant="outline">{v.value}</Badge>
              ))}
            </div>
            {showPreview && (
              <div className="mt-4">
                <label className="font-semibold mb-1 block">Preview</label>
                {renderPreview()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Irrelevancy Detection Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Rules</span>
            <Button variant="outline" size="sm" onClick={openAddRule}>
              <Plus className="w-4 h-4 mr-1" /> Add Rule
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th className="text-left">Keywords</th>
                  <th className="text-left">Threshold</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 && (
                  <tr><td colSpan={3} className="text-muted-foreground text-center py-4">No rules defined.</td></tr>
                )}
                {rules.map((rule, idx) => (
                  <tr key={idx} className="odd:bg-muted">
                    <td className="max-w-[200px] truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate">{rule.keywords?.join(', ')}</span>
                          </TooltipTrigger>
                          <TooltipContent>{rule.keywords?.join(', ')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="max-w-[80px] truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate">{rule.threshold}</span>
                          </TooltipTrigger>
                          <TooltipContent>{rule.threshold}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="flex gap-2">
                      <Button variant="ghost" size="icon" aria-label="Edit Rule" onClick={() => openEditRule(rule, idx)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="Delete Rule" onClick={() => deleteRule(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="font-semibold">Keywords/Phrases</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Add keyword..."
                      value={ruleForm._newKeyword || ''}
                      onChange={e => handleRuleFormChange('_newKeyword', e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          addKeyword(ruleForm._newKeyword);
                          handleRuleFormChange('_newKeyword', '');
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={() => { addKeyword(ruleForm._newKeyword); handleRuleFormChange('_newKeyword', ''); }}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ruleForm.keywords.map((kw: string, i: number) => (
                      <Badge key={i} variant="outline" className="flex items-center gap-1">{kw} <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => removeKeyword(i)}><Trash2 className="w-3 h-3 text-destructive" /></Button></Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Confidence Threshold</label>
                  <div className="flex items-center gap-4 mt-1">
                    <Slider min={0} max={1} step={0.01} value={[ruleForm.threshold]} onValueChange={([v]) => handleRuleFormChange('threshold', v)} className="w-40" />
                    <span className="text-sm text-muted-foreground">{ruleForm.threshold}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveRule}>{editingRule ? 'Save Changes' : 'Add Rule'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      {/* Version History */}
      {versionHistory.length > 0 && (
        <div className="mt-4">
          <Separator className="mb-2" />
          <label className="font-semibold mb-1 block">Version History</label>
          <ul className="space-y-2">
            {versionHistory.map((v, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</span>
                <Button size="sm" variant="outline" onClick={() => revertVersion(idx)}>Revert</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 