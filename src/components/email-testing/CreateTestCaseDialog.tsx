'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Upload } from 'lucide-react';
import { EmailTestCase } from '@/types/Client';

interface CreateTestCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (testCase: Omit<EmailTestCase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loading?: boolean;
}

interface Attachment {
  filename: string;
  contentType: string;
  content: string; // base64 encoded
}

export function CreateTestCaseDialog({ open, onOpenChange, onSave, loading }: CreateTestCaseDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'auto-loan',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    emailTemplate: {
      subject: '',
      body: '',
      attachments: [] as Attachment[]
    },
    expectedExtraction: {}
  });

  const [expectedFields, setExpectedFields] = useState<Array<{ key: string; value: string; type: string }>>([
    { key: 'applicantName', value: '', type: 'text' },
    { key: 'loanAmount', value: '', type: 'number' },
    { key: 'employmentStatus', value: '', type: 'text' }
  ]);

  const handleSave = async () => {
    try {
      // Convert expected fields to object
      const expectedExtraction = expectedFields.reduce((acc, field) => {
        if (field.key && field.value) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, any>);

      const testCaseData = {
        ...formData,
        expectedExtraction,
        metadata: {
          difficulty: formData.difficulty
        }
      };

      await onSave(testCaseData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'auto-loan',
        difficulty: 'medium',
        emailTemplate: {
          subject: '',
          body: '',
          attachments: []
        },
        expectedExtraction: {}
      });
      setExpectedFields([
        { key: 'applicantName', value: '', type: 'text' },
        { key: 'loanAmount', value: '', type: 'number' },
        { key: 'employmentStatus', value: '', type: 'text' }
      ]);

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving test case:', error);
    }
  };

  const addExpectedField = () => {
    setExpectedFields([...expectedFields, { key: '', value: '', type: 'text' }]);
  };

  const removeExpectedField = (index: number) => {
    setExpectedFields(expectedFields.filter((_, i) => i !== index));
  };

  const updateExpectedField = (index: number, field: Partial<{ key: string; value: string; type: string }>) => {
    const updated = [...expectedFields];
    updated[index] = { ...updated[index], ...field };
    setExpectedFields(updated);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // Remove data:mime;base64, prefix

      const attachment: Attachment = {
        filename: file.name,
        contentType: file.type,
        content: base64Data
      };

      setFormData(prev => ({
        ...prev,
        emailTemplate: {
          ...prev.emailTemplate,
          attachments: [...prev.emailTemplate.attachments, attachment]
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emailTemplate: {
        ...prev.emailTemplate,
        attachments: prev.emailTemplate.attachments.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test Case</DialogTitle>
          <DialogDescription>
            Define a test case for automated email testing with expected results.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="email">Email Template</TabsTrigger>
            <TabsTrigger value="expected">Expected Results</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Test Case Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Auto Loan Application - Basic Info"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this test case validates..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto-loan">Auto Loan</SelectItem>
                      <SelectItem value="property-finance">Property Finance</SelectItem>
                      <SelectItem value="sme-finance">SME Finance</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                      setFormData(prev => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Loan Application Request - John Smith"
                  value={formData.emailTemplate.subject}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emailTemplate: { ...prev.emailTemplate, subject: e.target.value }
                  }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  placeholder="Write the email content here. You can include applicant details, loan amount, employment information, etc."
                  rows={10}
                  value={formData.emailTemplate.body}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emailTemplate: { ...prev.emailTemplate, body: e.target.value }
                  }))}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Attachments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formData.emailTemplate.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{attachment.filename}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="attachment"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.png,.txt"
                    />
                    <Label htmlFor="attachment" className="cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload attachment
                      </p>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Extraction Results</CardTitle>
                <CardDescription>
                  Define what data should be extracted from this email by the AI system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expectedFields.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label>Field Name</Label>
                      <Input
                        placeholder="e.g., applicantName"
                        value={field.key}
                        onChange={(e) => updateExpectedField(index, { key: e.target.value })}
                      />
                    </div>
                    <div className="col-span-6">
                      <Label>Expected Value</Label>
                      <Input
                        placeholder="e.g., John Smith"
                        value={field.value}
                        onChange={(e) => updateExpectedField(index, { value: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExpectedField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExpectedField}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.name || !formData.emailTemplate.subject}
          >
            {loading ? 'Creating...' : 'Create Test Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}