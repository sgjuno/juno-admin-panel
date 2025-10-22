'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Settings,
  Eye,
  Download,
  Zap,
  Timer,
  Monitor
} from 'lucide-react';

interface TestExecutionMonitorProps {
  clientId: string;
  testCases: any[];
  onExecutionComplete?: (results: any[]) => void;
}

interface ExecutionQueue {
  queueId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    failed: number;
    current?: string;
  };
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;
  resultIds: string[];
}

interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  testCaseId?: string;
  metadata?: Record<string, any>;
}

interface ExecutionOptions {
  parallelLimit: number;
  retryAttempts: number;
  timeout: number;
  selectedTestCases: string[];
}

const LOG_LEVEL_COLORS = {
  info: 'text-blue-600',
  warn: 'text-yellow-600',
  error: 'text-red-600',
  debug: 'text-gray-600'
};

const LOG_LEVEL_ICONS = {
  info: Activity,
  warn: AlertTriangle,
  error: XCircle,
  debug: Eye
};

export function TestExecutionMonitor({
  clientId,
  testCases,
  onExecutionComplete
}: TestExecutionMonitorProps) {
  const [activeQueue, setActiveQueue] = useState<ExecutionQueue | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Execution options
  const [executionOptions, setExecutionOptions] = useState<ExecutionOptions>({
    parallelLimit: 3,
    retryAttempts: 1,
    timeout: 30000,
    selectedTestCases: []
  });

  // Polling interval for real-time updates
  useEffect(() => {
    if (!activeQueue || !autoRefresh) return;

    const interval = setInterval(() => {
      if (activeQueue.status === 'running') {
        fetchQueueStatus();
        fetchLogs();
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [activeQueue, autoRefresh]);

  const fetchQueueStatus = useCallback(async () => {
    if (!activeQueue) return;

    try {
      const response = await fetch(
        `/api/clients/${clientId}/email-testing/monitoring?queueId=${activeQueue.queueId}`
      );

      if (response.ok) {
        const data = await response.json();
        setActiveQueue(prev => prev ? { ...prev, ...data } : data);

        // Check if execution completed
        if ((data.status === 'completed' || data.status === 'failed') && data.resultIds) {
          onExecutionComplete?.(data.resultIds);
        }
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  }, [activeQueue, clientId, onExecutionComplete]);

  const fetchLogs = useCallback(async () => {
    if (!activeQueue) return;

    try {
      const response = await fetch(
        `/api/clients/${clientId}/email-testing/monitoring?queueId=${activeQueue.queueId}&action=logs&limit=50`
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [activeQueue, clientId]);

  const startExecution = async () => {
    if (executionOptions.selectedTestCases.length === 0) {
      setError('Please select at least one test case to execute');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          testCaseIds: executionOptions.selectedTestCases,
          options: {
            parallelLimit: executionOptions.parallelLimit,
            retryAttempts: executionOptions.retryAttempts,
            timeout: executionOptions.timeout
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const queueResponse = await fetch(
          `/api/clients/${clientId}/email-testing/monitoring?queueId=${data.queueId}`
        );
        const queueData = await queueResponse.json();

        setActiveQueue(queueData);
        setLogs([]);
      } else {
        setError(data.error || 'Failed to start execution');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error starting execution:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelExecution = async () => {
    if (!activeQueue) return;

    try {
      const response = await fetch(`/api/clients/${clientId}/email-testing/monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          queueId: activeQueue.queueId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setActiveQueue(prev => prev ? { ...prev, status: 'cancelled' } : null);
      } else {
        setError('Failed to cancel execution');
      }
    } catch (error) {
      setError('Error cancelling execution');
      console.error('Error cancelling execution:', error);
    }
  };

  const toggleTestCaseSelection = (testCaseId: string) => {
    setExecutionOptions(prev => ({
      ...prev,
      selectedTestCases: prev.selectedTestCases.includes(testCaseId)
        ? prev.selectedTestCases.filter(id => id !== testCaseId)
        : [...prev.selectedTestCases, testCaseId]
    }));
  };

  const selectAllTestCases = () => {
    setExecutionOptions(prev => ({
      ...prev,
      selectedTestCases: testCases.map(tc => tc.id)
    }));
  };

  const deselectAllTestCases = () => {
    setExecutionOptions(prev => ({
      ...prev,
      selectedTestCases: []
    }));
  };

  const exportLogs = () => {
    if (logs.length === 0) return;

    const logText = logs
      .map(log => `[${log.timestamp.toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return RefreshCw;
      case 'completed': return CheckCircle;
      case 'failed': case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            Test Execution Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring and control for email test execution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className={`h-3 w-3 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {activeQueue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {React.createElement(getStatusIcon(activeQueue.status), {
                  className: `h-5 w-5 ${getStatusColor(activeQueue.status)} ${
                    activeQueue.status === 'running' ? 'animate-spin' : ''
                  }`
                })}
                Execution Status
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={activeQueue.status === 'running' ? 'default' : 'secondary'}>
                  {activeQueue.status}
                </Badge>
                {activeQueue.status === 'running' && (
                  <Button variant="destructive" size="sm" onClick={cancelExecution}>
                    <Square className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Queue ID: {activeQueue.queueId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {activeQueue.progress.completed + activeQueue.progress.failed} / {activeQueue.progress.total}
                </p>
                <Progress
                  value={((activeQueue.progress.completed + activeQueue.progress.failed) / activeQueue.progress.total) * 100}
                  className="mt-2"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{activeQueue.progress.completed}</p>
                <p className="text-xs text-muted-foreground">
                  {activeQueue.progress.total > 0
                    ? Math.round((activeQueue.progress.completed / activeQueue.progress.total) * 100)
                    : 0}% success rate
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{activeQueue.progress.failed}</p>
                <p className="text-xs text-muted-foreground">
                  {activeQueue.progress.total > 0
                    ? Math.round((activeQueue.progress.failed / activeQueue.progress.total) * 100)
                    : 0}% failure rate
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className="text-2xl font-bold">
                  {activeQueue.estimatedTimeRemaining
                    ? formatDuration(activeQueue.estimatedTimeRemaining)
                    : '--'}
                </p>
                {activeQueue.startedAt && (
                  <p className="text-xs text-muted-foreground">
                    Started {new Date(activeQueue.startedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {activeQueue.progress.current && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800">Currently Processing</p>
                <p className="text-sm text-blue-600">Test Case ID: {activeQueue.progress.current}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Execution Setup</TabsTrigger>
          <TabsTrigger value="logs">Live Logs</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Test Case Selection</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllTestCases}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllTestCases}>
                    Clear All
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Choose which test cases to execute ({executionOptions.selectedTestCases.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {testCases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={executionOptions.selectedTestCases.includes(testCase.id)}
                        onCheckedChange={() => toggleTestCaseSelection(testCase.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{testCase.name}</p>
                        <p className="text-sm text-muted-foreground">{testCase.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {testCase.category && (
                          <Badge variant="outline">{testCase.category}</Badge>
                        )}
                        {testCase.metadata?.difficulty && (
                          <Badge variant="secondary">{testCase.metadata.difficulty}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {executionOptions.selectedTestCases.length} test cases selected
                </div>
                <Button
                  onClick={startExecution}
                  disabled={loading || executionOptions.selectedTestCases.length === 0 ||
                    (activeQueue?.status === 'running')}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Execution
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Execution Logs
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{logs.length} entries</Badge>
                  <Button variant="outline" size="sm" onClick={exportLogs} disabled={logs.length === 0}>
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchLogs}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {logs.length > 0 ? (
                  <div className="space-y-1 font-mono text-sm">
                    {logs.map((log, index) => {
                      const IconComponent = LOG_LEVEL_ICONS[log.level];
                      return (
                        <div key={index} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                          <IconComponent className={`h-3 w-3 mt-0.5 ${LOG_LEVEL_COLORS[log.level]}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              <Badge variant="outline" className="text-xs py-0">
                                {log.level}
                              </Badge>
                              {log.testCaseId && (
                                <Badge variant="secondary" className="text-xs py-0">
                                  {log.testCaseId.substring(0, 8)}...
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{log.message}</p>
                            {log.metadata && (
                              <pre className="text-xs text-muted-foreground mt-1 bg-muted/50 p-1 rounded">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No logs available</p>
                    <p className="text-sm">Start an execution to see real-time logs</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Execution Settings
              </CardTitle>
              <CardDescription>
                Configure advanced execution parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Parallel Limit</label>
                  <Select
                    value={executionOptions.parallelLimit.toString()}
                    onValueChange={(value) =>
                      setExecutionOptions(prev => ({ ...prev, parallelLimit: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} concurrent test{num !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of tests to run simultaneously
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Retry Attempts</label>
                  <Select
                    value={executionOptions.retryAttempts.toString()}
                    onValueChange={(value) =>
                      setExecutionOptions(prev => ({ ...prev, retryAttempts: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} retr{num !== 1 ? 'ies' : 'y'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of retry attempts for failed tests
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Timeout (seconds)</label>
                  <Select
                    value={(executionOptions.timeout / 1000).toString()}
                    onValueChange={(value) =>
                      setExecutionOptions(prev => ({ ...prev, timeout: parseInt(value) * 1000 }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 30, 45, 60, 90, 120].map(seconds => (
                        <SelectItem key={seconds} value={seconds.toString()}>
                          {seconds} seconds
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum time per test execution
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Performance Estimate</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estimated Duration:</span>
                    <span className="ml-2 font-medium">
                      {Math.ceil((executionOptions.selectedTestCases.length * 4) / executionOptions.parallelLimit)} seconds
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Concurrent:</span>
                    <span className="ml-2 font-medium">
                      {Math.min(executionOptions.parallelLimit, executionOptions.selectedTestCases.length)} tests
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}