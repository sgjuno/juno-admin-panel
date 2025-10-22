'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Wand2,
  Download,
  Upload,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  Database,
  Sparkles
} from 'lucide-react';

interface SyntheticDataGeneratorProps {
  clientId: string;
  onDataGenerated?: (data: any[]) => void;
  onImportToTestCases?: (testCases: any[]) => void;
}

interface GenerationRequest {
  scenario: 'lending-application' | 'broker-communication' | 'document-request' | 'follow-up' | 'compliance';
  count: number;
  industry: 'finance' | 'lending' | 'broker';
  complexity: 'simple' | 'medium' | 'complex';
  attachmentTypes?: string[];
  customPrompt?: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: string;
  }>;
  expectedExtraction: Record<string, any>;
  metadata: {
    scenario: string;
    industry: string;
    complexity: string;
    generatedAt: Date;
    syntheticDataId: string;
  };
}

interface GenerationHistory {
  timestamp: Date;
  scenarioType: string;
  dataCount: number;
  status: 'success' | 'failed';
}

const SCENARIO_DESCRIPTIONS = {
  'lending-application': 'Generate realistic lending application emails with financial details, property information, and borrower data',
  'broker-communication': 'Create broker-to-client communications including updates, approvals, and status changes',
  'document-request': 'Generate document request emails asking for various financial and legal documents',
  'follow-up': 'Create follow-up email sequences for pending applications and missing information',
  'compliance': 'Generate compliance-related communications including regulatory updates and requirements'
};

const COMPLEXITY_DESCRIPTIONS = {
  simple: 'Basic scenarios with straightforward data extraction requirements',
  medium: 'Moderate complexity with multiple data points and some nested information',
  complex: 'Advanced scenarios with complex data structures and edge cases'
};

export function SyntheticDataGenerator({
  clientId,
  onDataGenerated,
  onImportToTestCases
}: SyntheticDataGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedEmail[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [previewEmail, setPreviewEmail] = useState<GeneratedEmail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [scenario, setScenario] = useState<GenerationRequest['scenario']>('lending-application');
  const [count, setCount] = useState(5);
  const [industry, setIndustry] = useState<GenerationRequest['industry']>('lending');
  const [complexity, setComplexity] = useState<GenerationRequest['complexity']>('medium');
  const [attachmentTypes, setAttachmentTypes] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [includeAttachments, setIncludeAttachments] = useState(false);

  useEffect(() => {
    fetchGenerationHistory();
  }, [clientId]);

  const fetchGenerationHistory = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/synthetic-generation`);
      if (response.ok) {
        const data = await response.json();
        setGenerationHistory(data.generationHistory || []);
      }
    } catch (error) {
      console.error('Error fetching generation history:', error);
    }
  };

  const generateSyntheticData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const request: GenerationRequest = {
        scenario,
        count,
        industry,
        complexity,
        ...(includeAttachments && { attachmentTypes }),
        ...(customPrompt && { customPrompt })
      };

      const response = await fetch(`/api/clients/${clientId}/email-testing/synthetic-generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedData(data.emails);
        setSuccess(`Successfully generated ${data.generatedCount} synthetic emails`);
        fetchGenerationHistory(); // Refresh history
        onDataGenerated?.(data.emails);
      } else {
        setError(data.error || 'Failed to generate synthetic data');
      }
    } catch (error) {
      setError('Network error occurred while generating data');
      console.error('Error generating synthetic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const importAsTestCases = async () => {
    if (generatedData.length === 0) return;

    try {
      const testCases = generatedData.map(email => ({
        name: `Synthetic: ${email.subject}`,
        description: `Auto-generated ${email.metadata.scenario} test case`,
        category: email.metadata.scenario,
        emailTemplate: {
          subject: email.subject,
          body: email.body,
          attachments: email.attachments
        },
        expectedExtraction: email.expectedExtraction,
        metadata: {
          difficulty: email.metadata.complexity,
          isSynthetic: true,
          generatedAt: email.metadata.generatedAt
        }
      }));

      const response = await fetch(`/api/clients/${clientId}/email-testing/batch-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'import-test-cases',
          data: testCases,
          format: 'json'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(`Successfully imported ${result.processed} test cases`);
        onImportToTestCases?.(result.results);
        setGeneratedData([]); // Clear generated data
      } else {
        setError('Failed to import test cases');
      }
    } catch (error) {
      setError('Error importing test cases');
      console.error('Error importing test cases:', error);
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    if (generatedData.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(generatedData, null, 2);
      filename = `synthetic-emails-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      // Convert to CSV
      const headers = ['subject', 'scenario', 'complexity', 'industry', 'extractedFields'];
      const rows = generatedData.map(email => [
        `"${email.subject}"`,
        email.metadata.scenario,
        email.metadata.complexity,
        email.metadata.industry,
        `"${Object.keys(email.expectedExtraction).join(', ')}"`
      ]);

      content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      filename = `synthetic-emails-${Date.now()}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAttachmentType = (type: string) => {
    setAttachmentTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Synthetic Data Generator</h2>
          <p className="text-muted-foreground">
            Generate realistic email test data using AI for comprehensive testing
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI-Powered
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Data</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generate Synthetic Emails
              </CardTitle>
              <CardDescription>
                Configure the parameters for synthetic email generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scenario">Scenario Type</Label>
                    <Select value={scenario} onValueChange={(value: any) => setScenario(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SCENARIO_DESCRIPTIONS).map(([value, description]) => (
                          <SelectItem key={value} value={value}>
                            <div>
                              <div className="font-medium capitalize">
                                {value.replace('-', ' ')}
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry Focus</Label>
                    <Select value={industry} onValueChange={(value: any) => setIndustry(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="lending">Lending</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="complexity">Complexity Level</Label>
                    <Select value={complexity} onValueChange={(value: any) => setComplexity(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMPLEXITY_DESCRIPTIONS).map(([value, description]) => (
                          <SelectItem key={value} value={value}>
                            <div>
                              <div className="font-medium capitalize">{value}</div>
                              <div className="text-sm text-muted-foreground">
                                {description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="count">Number of Emails</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="50"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate 1-50 synthetic emails (limit for quality)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="attachments"
                        checked={includeAttachments}
                        onCheckedChange={(checked) => setIncludeAttachments(!!checked)}
                      />
                      <Label htmlFor="attachments">Include Attachments</Label>
                    </div>

                    {includeAttachments && (
                      <div className="ml-6 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Select attachment types to include:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {['PDF', 'DOC', 'XLS', 'JPG'].map((type) => (
                            <Badge
                              key={type}
                              variant={attachmentTypes.includes(type) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleAttachmentType(type)}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customPrompt">Custom Prompt (Optional)</Label>
                    <Textarea
                      id="customPrompt"
                      placeholder="Add specific requirements or constraints for generation..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Selected: {SCENARIO_DESCRIPTIONS[scenario]}
                </div>
                <Button
                  onClick={generateSyntheticData}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Generate {count} Email{count !== 1 ? 's' : ''}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Generated Data Preview
                  </span>
                  {generatedData.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportData('json')}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportData('csv')}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        CSV
                      </Button>
                      <Button
                        onClick={importAsTestCases}
                        className="flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Import as Test Cases
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  {generatedData.length > 0
                    ? `${generatedData.length} synthetic emails ready for review`
                    : 'Generate emails to see preview'
                  }
                </CardDescription>
              </CardHeader>
              {generatedData.length > 0 && (
                <CardContent>
                  <div className="space-y-4">
                    {generatedData.slice(0, 3).map((email, index) => (
                      <div
                        key={email.metadata.syntheticDataId}
                        className="border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-muted/50"
                        onClick={() => setPreviewEmail(email)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{email.subject}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {email.body.substring(0, 100)}...
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{email.metadata.complexity}</Badge>
                            <Badge variant="secondary">{email.metadata.scenario}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{Object.keys(email.expectedExtraction).length} fields to extract</span>
                          {email.attachments && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {generatedData.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ...and {generatedData.length - 3} more emails
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {previewEmail && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Email Preview</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewEmail(null)}
                    >
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Subject</Label>
                    <p className="text-sm bg-muted p-2 rounded">{previewEmail.subject}</p>
                  </div>
                  <div>
                    <Label>Body</Label>
                    <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {previewEmail.body}
                    </pre>
                  </div>
                  <div>
                    <Label>Expected Extraction</Label>
                    <pre className="text-sm bg-muted p-3 rounded">
                      {JSON.stringify(previewEmail.expectedExtraction, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Generation History
              </CardTitle>
              <CardDescription>
                Track your synthetic data generation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generationHistory.length > 0 ? (
                <div className="space-y-3">
                  {generationHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {record.scenarioType.replace('-', ' ')} scenario
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{record.dataCount} emails</Badge>
                        <Badge variant={record.status === 'success' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No generation history yet</p>
                  <p className="text-sm">Generate some synthetic data to see history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}