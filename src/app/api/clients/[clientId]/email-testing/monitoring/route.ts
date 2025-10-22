import { NextRequest, NextResponse } from 'next/server';
import Client from '@/models/Client';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface ExecutionQueue {
  queueId: string;
  clientId: string;
  testCaseIds: string[];
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    failed: number;
    current?: string; // current test case being executed
  };
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number; // milliseconds
  logs: ExecutionLog[];
  results: string[]; // test result IDs
}

interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  testCaseId?: string;
  metadata?: Record<string, any>;
}

interface MonitoringRequest {
  action: 'start' | 'pause' | 'resume' | 'cancel' | 'status';
  testCaseIds?: string[];
  queueId?: string;
  options?: {
    parallelLimit?: number;
    retryAttempts?: number;
    timeout?: number;
  };
}

// In-memory storage for execution queues (in production, use Redis or similar)
const executionQueues = new Map<string, ExecutionQueue>();
const activeExecutions = new Map<string, NodeJS.Timeout>();

function addLogEntry(queueId: string, level: ExecutionLog['level'], message: string, testCaseId?: string, metadata?: Record<string, any>) {
  const queue = executionQueues.get(queueId);
  if (queue) {
    queue.logs.push({
      timestamp: new Date(),
      level,
      message,
      testCaseId,
      metadata
    });

    // Keep only last 100 log entries per queue
    if (queue.logs.length > 100) {
      queue.logs = queue.logs.slice(-100);
    }
  }
}

async function simulateTestExecution(
  queueId: string,
  testCaseId: string,
  clientId: string
): Promise<{ success: boolean; resultId?: string; error?: string }> {
  addLogEntry(queueId, 'info', `Starting execution of test case ${testCaseId}`, testCaseId);

  try {
    // Simulate email sending delay (1-3 seconds)
    const emailDelay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, emailDelay));

    addLogEntry(queueId, 'info', 'Email sent successfully', testCaseId, { emailDeliveryTime: emailDelay });

    // Simulate AI processing delay (2-5 seconds)
    const aiDelay = Math.random() * 3000 + 2000;
    await new Promise(resolve => setTimeout(resolve, aiDelay));

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      const resultId = uuidv4();
      addLogEntry(queueId, 'info', 'Test completed successfully', testCaseId, {
        resultId,
        totalTime: emailDelay + aiDelay,
        aiProcessingTime: aiDelay
      });

      // In a real implementation, save the result to the database
      // For now, just return the result ID
      return { success: true, resultId };
    } else {
      const error = 'Simulated AI processing failure';
      addLogEntry(queueId, 'error', error, testCaseId);
      return { success: false, error };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addLogEntry(queueId, 'error', `Test execution failed: ${errorMessage}`, testCaseId);
    return { success: false, error: errorMessage };
  }
}

async function executeTestQueue(queueId: string, clientId: string, options: { parallelLimit?: number; retryAttempts?: number } = {}) {
  const queue = executionQueues.get(queueId);
  if (!queue) return;

  const parallelLimit = options.parallelLimit || 3;
  const retryAttempts = options.retryAttempts || 1;

  queue.status = 'running';
  queue.startedAt = new Date();

  addLogEntry(queueId, 'info', `Starting execution of ${queue.testCaseIds.length} test cases with parallel limit ${parallelLimit}`);

  const executeTestCase = async (testCaseId: string, attempt: number = 1): Promise<void> => {
    queue.progress.current = testCaseId;

    const result = await simulateTestExecution(queueId, testCaseId, clientId);

    if (result.success && result.resultId) {
      queue.results.push(result.resultId);
      queue.progress.completed += 1;
    } else {
      if (attempt < retryAttempts) {
        addLogEntry(queueId, 'warn', `Retrying test case ${testCaseId} (attempt ${attempt + 1}/${retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff
        return executeTestCase(testCaseId, attempt + 1);
      } else {
        queue.progress.failed += 1;
      }
    }
  };

  // Execute test cases with parallel limit
  const batches: string[][] = [];
  for (let i = 0; i < queue.testCaseIds.length; i += parallelLimit) {
    batches.push(queue.testCaseIds.slice(i, i + parallelLimit));
  }

  for (const batch of batches) {
    if ((queue.status as ExecutionQueue['status']) === 'cancelled') {
      addLogEntry(queueId, 'info', 'Execution cancelled by user');
      break;
    }

    addLogEntry(queueId, 'info', `Executing batch of ${batch.length} test cases`);

    await Promise.all(batch.map(testCaseId => executeTestCase(testCaseId)));

    // Update estimated time remaining
    const completedTests = queue.progress.completed + queue.progress.failed;
    const remainingTests = queue.testCaseIds.length - completedTests;
    const elapsedTime = Date.now() - (queue.startedAt?.getTime() || Date.now());
    const avgTimePerTest = elapsedTime / Math.max(completedTests, 1);
    queue.estimatedTimeRemaining = remainingTests * avgTimePerTest;
  }

  if (queue.status === 'running') {
    queue.status = 'completed';
    queue.completedAt = new Date();
    queue.progress.current = undefined;
    queue.estimatedTimeRemaining = 0;

    addLogEntry(queueId, 'info', `Execution completed. ${queue.progress.completed} successful, ${queue.progress.failed} failed`);
  }

  // Clean up active execution reference
  activeExecutions.delete(queueId);
}

function startExecution(clientId: string, testCaseIds: string[], options: MonitoringRequest['options'] = {}): string {
  const queueId = uuidv4();

  const queue: ExecutionQueue = {
    queueId,
    clientId,
    testCaseIds,
    status: 'queued',
    progress: {
      total: testCaseIds.length,
      completed: 0,
      failed: 0
    },
    logs: [],
    results: []
  };

  executionQueues.set(queueId, queue);

  // Start execution asynchronously
  const executionPromise = executeTestQueue(queueId, clientId, options);
  activeExecutions.set(queueId, executionPromise as any);

  return queueId;
}

function cancelExecution(queueId: string): boolean {
  const queue = executionQueues.get(queueId);
  if (queue && (queue.status === 'queued' || queue.status === 'running')) {
    queue.status = 'cancelled';
    queue.completedAt = new Date();
    addLogEntry(queueId, 'warn', 'Execution cancelled');

    const execution = activeExecutions.get(queueId);
    if (execution) {
      // Note: In a real implementation, you'd need to properly cancel the Promise
      activeExecutions.delete(queueId);
    }

    return true;
  }
  return false;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const requestData: MonitoringRequest = await request.json();
    const { clientId } = await params;

    // Connect to MongoDB to validate client
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    switch (requestData.action) {
      case 'start': {
        if (!requestData.testCaseIds || requestData.testCaseIds.length === 0) {
          return NextResponse.json(
            { error: 'Test case IDs are required to start execution' },
            { status: 400 }
          );
        }

        // Validate test cases exist
        const testCases = client.emailTesting?.testCases || [];
        const validTestCaseIds = requestData.testCaseIds.filter((id: string) =>
          testCases.some((tc: any) => tc.id === id)
        );

        if (validTestCaseIds.length === 0) {
          return NextResponse.json(
            { error: 'No valid test cases found' },
            { status: 400 }
          );
        }

        const queueId = startExecution(clientId, validTestCaseIds, requestData.options);

        return NextResponse.json({
          success: true,
          queueId,
          testCasesQueued: validTestCaseIds.length,
          estimatedDuration: `${Math.ceil(validTestCaseIds.length * 4 / (requestData.options?.parallelLimit || 3))} seconds`
        });
      }

      case 'cancel': {
        if (!requestData.queueId) {
          return NextResponse.json(
            { error: 'Queue ID is required to cancel execution' },
            { status: 400 }
          );
        }

        const success = cancelExecution(requestData.queueId);

        return NextResponse.json({
          success,
          message: success ? 'Execution cancelled successfully' : 'Could not cancel execution (may already be completed)'
        });
      }

      case 'status': {
        if (!requestData.queueId) {
          return NextResponse.json(
            { error: 'Queue ID is required to get status' },
            { status: 400 }
          );
        }

        const queue = executionQueues.get(requestData.queueId);
        if (!queue) {
          return NextResponse.json(
            { error: 'Queue not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          queueId: queue.queueId,
          status: queue.status,
          progress: queue.progress,
          startedAt: queue.startedAt,
          completedAt: queue.completedAt,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          recentLogs: queue.logs.slice(-10) // Return last 10 log entries
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in monitoring endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');
    const action = searchParams.get('action');

    if (queueId) {
      const queue = executionQueues.get(queueId);
      if (!queue || queue.clientId !== clientId) {
        return NextResponse.json(
          { error: 'Queue not found' },
          { status: 404 }
        );
      }

      if (action === 'logs') {
        // Return streaming logs (in a real implementation, consider SSE)
        const limit = parseInt(searchParams.get('limit') || '50');
        const since = searchParams.get('since');

        let logs = queue.logs;
        if (since) {
          const sinceDate = new Date(since);
          logs = logs.filter(log => log.timestamp > sinceDate);
        }

        return NextResponse.json({
          queueId: queue.queueId,
          logs: logs.slice(-limit),
          hasMore: queue.logs.length > limit
        });
      }

      // Return full queue status
      return NextResponse.json({
        queueId: queue.queueId,
        status: queue.status,
        progress: queue.progress,
        startedAt: queue.startedAt,
        completedAt: queue.completedAt,
        estimatedTimeRemaining: queue.estimatedTimeRemaining,
        totalLogs: queue.logs.length,
        resultIds: queue.results
      });
    }

    // Return all active queues for this client
    const clientQueues = Array.from(executionQueues.values())
      .filter(queue => queue.clientId === clientId)
      .map(queue => ({
        queueId: queue.queueId,
        status: queue.status,
        progress: queue.progress,
        startedAt: queue.startedAt,
        completedAt: queue.completedAt,
        testCaseCount: queue.testCaseIds.length
      }));

    return NextResponse.json({
      activeQueues: clientQueues,
      capabilities: {
        maxParallelLimit: 10,
        maxRetryAttempts: 3,
        defaultTimeout: 30000,
        supportedActions: ['start', 'cancel', 'status'],
        realTimeUpdates: true
      },
      systemStatus: {
        totalActiveQueues: executionQueues.size,
        totalActiveExecutions: activeExecutions.size
      }
    });

  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cleanup old queues periodically (in production, implement proper cleanup)
setInterval(() => {
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

  for (const [queueId, queue] of executionQueues.entries()) {
    const queueTime = queue.completedAt?.getTime() || queue.startedAt?.getTime() || 0;
    if (queueTime < cutoffTime && queue.status !== 'running') {
      executionQueues.delete(queueId);
    }
  }
}, 60 * 60 * 1000); // Run cleanup every hour