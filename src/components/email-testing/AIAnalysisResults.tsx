'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Download,
  RefreshCw,
  Target,
  Lightbulb,
  BarChart3,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AIAnalysisResultsProps {
  clientId: string;
  testResultId?: string;
  analysisResult?: AIAnalysisResult;
  onAnalysisUpdate?: (result: AIAnalysisResult) => void;
}

interface ValidationResult {
  field: string;
  expected: any;
  actual: any;
  match: boolean;
  confidence: number;
  similarity: number;
  issues?: string[];
}

interface AIAnalysisResult {
  analysisId: string;
  testResultId: string;
  overallAccuracy: number;
  overallConfidence: number;
  fieldValidations: ValidationResult[];
  recommendations: string[];
  insights: {
    commonErrors: string[];
    patternAnalysis: string[];
    improvementAreas: string[];
  };
  performance: {
    processingTime: number;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  };
  analyzedAt: Date;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
};

const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
  if (confidence >= 0.9) return 'default';
  if (confidence >= 0.7) return 'secondary';
  return 'destructive';
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

export function AIAnalysisResults({
  clientId,
  testResultId,
  analysisResult: initialAnalysisResult,
  onAnalysisUpdate
}: AIAnalysisResultsProps) {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(initialAnalysisResult || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (testResultId && !analysisResult) {
      fetchAnalysisResult();
    }
  }, [testResultId, clientId]);

  const fetchAnalysisResult = async () => {
    if (!testResultId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/ai-analysis?testResultId=${testResultId}`);
      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data.analysis);
        onAnalysisUpdate?.(data.analysis);
      } else {
        setError(data.error || 'Failed to fetch analysis result');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error fetching analysis result:', error);
    } finally {
      setLoading(false);
    }
  };

  const rerunAnalysis = async () => {
    if (!testResultId) return;

    setLoading(true);
    setError(null);

    try {
      // This would trigger a new analysis - placeholder for now
      // In real implementation, you'd need the original test data
      setError('Re-analysis feature requires test execution data');
    } catch (error) {
      setError('Failed to rerun analysis');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!analysisResult) return;

    const exportData = {
      analysis: analysisResult,
      exportedAt: new Date().toISOString(),
      summary: {
        accuracy: analysisResult.overallAccuracy,
        confidence: analysisResult.overallConfidence,
        totalFields: analysisResult.fieldValidations.length,
        successfulFields: analysisResult.fieldValidations.filter(f => f.match).length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analysis-${analysisResult.analysisId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFieldExpansion = (fieldName: string) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldName)) {
        newSet.delete(fieldName);
      } else {
        newSet.add(fieldName);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Analyzing results...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Results
          </CardTitle>
          <CardDescription>No analysis result available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No AI analysis data to display</p>
            <p className="text-sm">Run a test to see analysis results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Analysis Results
          </h2>
          <p className="text-muted-foreground">
            Automated validation and insights for email extraction accuracy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportResults}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={rerunAnalysis} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Re-analyze
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                <p className="text-2xl font-bold">{(analysisResult.overallAccuracy * 100).toFixed(1)}%</p>
              </div>
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <Progress value={analysisResult.overallAccuracy * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confidence Score</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(analysisResult.overallConfidence)}`}>
                  {(analysisResult.overallConfidence * 100).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <Progress value={analysisResult.overallConfidence * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fields Matched</p>
                <p className="text-2xl font-bold text-green-600">
                  {analysisResult.fieldValidations.filter(f => f.match).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {analysisResult.fieldValidations.length} total
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing Time</p>
                <p className="text-2xl font-bold">{analysisResult.performance.processingTime}ms</p>
                <p className="text-xs text-muted-foreground">
                  {analysisResult.performance.analysisDepth}
                </p>
              </div>
              <RefreshCw className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">Field Validation</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Field-by-Field Validation Results</CardTitle>
              <CardDescription>
                Detailed comparison of expected vs actual extraction results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {analysisResult.fieldValidations.map((validation, index) => {
                    const isExpanded = expandedFields.has(validation.field);
                    return (
                      <div key={index} className="border rounded-lg">
                        <Collapsible>
                          <CollapsibleTrigger
                            className="w-full"
                            onClick={() => toggleFieldExpansion(validation.field)}
                          >
                            <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                {validation.match ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <div className="text-left">
                                  <p className="font-medium">{validation.field}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {(validation.similarity * 100).toFixed(1)}% similarity
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getConfidenceBadgeVariant(validation.confidence)}>
                                  {(validation.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                                <Badge variant={validation.match ? "default" : "destructive"}>
                                  {validation.match ? "Match" : "No Match"}
                                </Badge>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-4 pb-4 border-t bg-muted/30">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <Label className="text-sm font-medium text-green-700">Expected</Label>
                                  <pre className="text-sm bg-green-50 border border-green-200 p-2 rounded mt-1 whitespace-pre-wrap">
                                    {formatValue(validation.expected)}
                                  </pre>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-blue-700">Actual</Label>
                                  <pre className="text-sm bg-blue-50 border border-blue-200 p-2 rounded mt-1 whitespace-pre-wrap">
                                    {formatValue(validation.actual)}
                                  </pre>
                                </div>
                              </div>

                              {validation.issues && validation.issues.length > 0 && (
                                <div className="mt-4">
                                  <Label className="text-sm font-medium text-red-700">Issues Identified</Label>
                                  <ul className="mt-2 space-y-1">
                                    {validation.issues.map((issue, issueIndex) => (
                                      <li key={issueIndex} className="text-sm text-red-600 flex items-start gap-1">
                                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        {issue}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                <div className="bg-white p-2 rounded border">
                                  <p className="text-xs text-muted-foreground">Similarity</p>
                                  <p className="text-sm font-medium">
                                    {(validation.similarity * 100).toFixed(1)}%
                                  </p>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <p className="text-xs text-muted-foreground">Confidence</p>
                                  <p className="text-sm font-medium">
                                    {(validation.confidence * 100).toFixed(1)}%
                                  </p>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <p className="text-xs text-muted-foreground">Status</p>
                                  <p className={`text-sm font-medium ${validation.match ? 'text-green-600' : 'text-red-600'}`}>
                                    {validation.match ? 'Match' : 'Mismatch'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>
                  Patterns and analysis from your test results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysisResult.insights.commonErrors.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Common Errors
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.insights.commonErrors.map((error, index) => (
                        <li key={index} className="text-sm bg-yellow-50 border border-yellow-200 p-2 rounded">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.insights.patternAnalysis.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Pattern Analysis
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.insights.patternAnalysis.map((pattern, index) => (
                        <li key={index} className="text-sm bg-blue-50 border border-blue-200 p-2 rounded">
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.insights.improvementAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Improvement Areas
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.insights.improvementAreas.map((area, index) => (
                        <li key={index} className="text-sm bg-green-50 border border-green-200 p-2 rounded">
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Actionable suggestions to improve extraction accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No specific recommendations available</p>
                  <p className="text-sm">Results look good overall!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Re-export Label component for internal use
const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`text-sm font-medium ${className || ''}`}>{children}</div>
);