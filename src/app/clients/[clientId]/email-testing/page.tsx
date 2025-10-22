'use client';

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Plus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Settings,
  BarChart3,
  TestTube,
  ShieldCheck,
  Wand2,
  Brain,
  Monitor,
  TrendingUp,
  Database,
  Sparkles
} from 'lucide-react';
import { Client, EmailTestCase, EmailTestResult } from '@/types/Client';
import { CreateTestCaseDialog } from '@/components/email-testing/CreateTestCaseDialog';
import { SyntheticDataGenerator } from '@/components/email-testing/SyntheticDataGenerator';
import { TestExecutionMonitor } from '@/components/email-testing/TestExecutionMonitor';
import { AIAnalysisResults } from '@/components/email-testing/AIAnalysisResults';

interface EmailTestingDashboardProps {
  params: Promise<{ clientId: string }>;
}

export default function EmailTestingDashboard({ params }: EmailTestingDashboardProps) {
  const { clientId } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [testCases, setTestCases] = useState<EmailTestCase[]>([]);
  const [testResults, setTestResults] = useState<EmailTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTests, setActiveTests] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchClientData();
    fetchTestCases();
    fetchTestResults();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        const clientData = await response.json();
        setClient(clientData);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
  };

  const fetchTestCases = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/test-cases`);
      if (response.ok) {
        const data = await response.json();
        setTestCases(data.testCases);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    }
  };

  const fetchTestResults = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/results`);
      if (response.ok) {
        const data = await response.json();
        setTestResults(data.results);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestCase = async (testCaseData: Omit<EmailTestCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    setCreating(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/test-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCaseData),
      });

      if (response.ok) {
        // Refresh test cases
        await fetchTestCases();
      } else {
        const error = await response.json();
        console.error('Failed to create test case:', error);
        throw new Error(error.error || 'Failed to create test case');
      }
    } catch (error) {
      console.error('Error creating test case:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const runTestCase = async (testCase: EmailTestCase) => {
    if (!testCase.id) return;

    setActiveTests(prev => [...prev, testCase.id!]);

    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/send-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testCaseId: testCase.id,
          emailTemplate: testCase.emailTemplate,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Test email sent:', result);

        // Refresh test results
        setTimeout(() => {
          fetchTestResults();
        }, 2000);
      } else {
        const error = await response.json();
        console.error('Failed to send test email:', error);
        alert(`Failed to send test email: ${error.error}`);
      }
    } catch (error) {
      console.error('Error running test case:', error);
      alert('Error running test case. Please try again.');
    } finally {
      setActiveTests(prev => prev.filter(id => id !== testCase.id));
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'partial') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'partial') => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading email testing dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleGmailAuthorization = () => {
    window.location.href = `/api/auth/google/authorize?clientId=${clientId}`;
  };

  if (!client?.emailTesting?.isEnabled || !client?.emailTesting?.gmailConfig?.isAuthorized) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>
                {!client?.emailTesting?.isEnabled
                  ? 'Email Testing Not Enabled'
                  : 'Gmail Authorization Required'}
              </CardTitle>
              <CardDescription>
                {!client?.emailTesting?.isEnabled
                  ? 'Enable email testing to start creating and running automated test cases for this client.'
                  : 'Authorize Gmail access to send and monitor test emails.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {!client?.emailTesting?.gmailConfig?.isAuthorized && (
                <div>
                  <Button onClick={handleGmailAuthorization} size="lg">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Authorize Gmail Access
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    You'll be redirected to Google to grant email permissions
                  </p>
                </div>
              )}
              {!client?.emailTesting?.isEnabled && (
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Enable Email Testing
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const analytics = client.emailTesting?.analytics;
  const recentResults = testResults.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TestTube className="h-8 w-8 text-blue-600" />
            Email Testing
            <Badge variant="outline" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Enhanced
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Comprehensive email testing suite for {client.companyName} with synthetic data generation and AI analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Database className="w-4 h-4" />
            {testCases.length} Test Cases
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            {testResults.length} Results
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Test Case
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalTestsRun || 0}</div>
            <p className="text-xs text-muted-foreground">
              {testCases.length} test cases configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.overallSuccessRate?.toFixed(1) || 0}%
            </div>
            <Progress value={analytics?.overallSuccessRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.averageAccuracy?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average extraction accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Test</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.lastTestRun
                ? new Date(analytics.lastTestRun).toLocaleDateString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent test execution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="test-cases" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="synthetic-data" className="flex items-center gap-1">
            <Wand2 className="h-3 w-3" />
            Synthetic Data
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Test Cases Tab */}
        <TabsContent value="test-cases" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Test Cases</h2>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Test Case
            </Button>
          </div>

          {testCases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No test cases yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first test case to start automated email testing.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Case
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {testCases.map((testCase) => (
                <Card key={testCase.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{testCase.name}</CardTitle>
                        <CardDescription>{testCase.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{testCase.metadata?.difficulty}</Badge>
                        <Button
                          size="sm"
                          onClick={() => runTestCase(testCase)}
                          disabled={activeTests.includes(testCase.id!)}
                        >
                          {activeTests.includes(testCase.id!) ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Run Test
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Subject:</strong> {testCase.emailTemplate.subject}
                      </div>
                      <div className="text-sm">
                        <strong>Category:</strong> {testCase.category || 'General'}
                      </div>
                      {testCase.metadata?.successRate !== undefined && (
                        <div className="text-sm">
                          <strong>Success Rate:</strong> {testCase.metadata.successRate.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Test Results</h2>
            <Button variant="outline">View All Results</Button>
          </div>

          {recentResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No test results yet</h3>
                <p className="text-muted-foreground">
                  Run some test cases to see results here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium">
                            Test Case: {testCases.find(tc => tc.id === result.testCaseId)?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(result.executedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status.toUpperCase()}
                        </Badge>
                        <div className="text-right text-sm">
                          <p>
                            Accuracy: {
                              result.validationResults.length > 0
                                ? ((result.validationResults.filter(v => v.match).length / result.validationResults.length) * 100).toFixed(1)
                                : 0
                            }%
                          </p>
                          <p className="text-muted-foreground">
                            {result.performance.totalTime}ms
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Email Inbox Tab */}
        <TabsContent value="inbox" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Email Inbox Monitoring</h2>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Refresh Inbox
            </Button>
          </div>

          <Alert>
            <Mail className="w-4 h-4" />
            <AlertDescription>
              Monitoring inbox for responses to test emails sent to: {client.enquireEmail}
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Email Monitoring</h3>
              <p className="text-muted-foreground">
                Real-time inbox monitoring will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synthetic Data Tab */}
        <TabsContent value="synthetic-data" className="space-y-4">
          <SyntheticDataGenerator
            clientId={clientId}
            onDataGenerated={(data) => {
              console.log('Synthetic data generated:', data);
            }}
            onImportToTestCases={(testCases) => {
              console.log('Test cases imported:', testCases);
              fetchTestCases(); // Refresh test cases list
            }}
          />
        </TabsContent>

        {/* Execution Monitor Tab */}
        <TabsContent value="execution" className="space-y-4">
          <TestExecutionMonitor
            clientId={clientId}
            testCases={testCases}
            onExecutionComplete={(results) => {
              console.log('Execution completed:', results);
              fetchTestResults(); // Refresh test results
            }}
          />
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-4">
          <AIAnalysisResults
            clientId={clientId}
            onAnalysisUpdate={(result) => {
              console.log('AI analysis updated:', result);
            }}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Advanced Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and reporting for email testing performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Advanced analytics coming soon</p>
                <p className="text-sm">Detailed performance metrics, trend analysis, and insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Email Testing Settings</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Configure email testing settings for this client.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Test Environment</label>
                  <p className="text-sm text-muted-foreground">
                    Current: {client.emailTesting?.testEnvironment || 'sandbox'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Enquiry Email</label>
                  <p className="text-sm text-muted-foreground">
                    {client.enquireEmail || 'Not configured'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Dedicated Test Emails</label>
                  <p className="text-sm text-muted-foreground">
                    {client.emailTesting?.dedicatedTestEmails?.join(', ') || 'None configured'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Test Case Dialog */}
      <CreateTestCaseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={createTestCase}
        loading={creating}
      />
    </div>
  );
}