import { NextRequest, NextResponse } from 'next/server';
import Client from '@/models/Client';
import mongoose from 'mongoose';
import { EmailTestResult } from '@/types/Client';

interface AnalyticsRequest {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
  metrics?: string[]; // specific metrics to calculate
  aggregation?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

interface TrendDataPoint {
  date: string;
  successRate: number;
  accuracy: number;
  testsRun: number;
  avgProcessingTime: number;
  failureRate: number;
}

interface AnalyticsResult {
  summary: {
    totalTests: number;
    overallSuccessRate: number;
    averageAccuracy: number;
    averageProcessingTime: number;
    totalFailures: number;
    lastTestRun?: Date;
  };
  trends: TrendDataPoint[];
  breakdown: {
    byStatus: Record<string, number>;
    byDifficulty: Record<string, { count: number; successRate: number }>;
    byCategory: Record<string, { count: number; successRate: number }>;
    byTimeRange: Record<string, number>;
  };
  performance: {
    averageEmailDeliveryTime: number;
    averageAIProcessingTime: number;
    averageTotalTime: number;
    slowestTests: Array<{
      testCaseId: string;
      name: string;
      totalTime: number;
      date: Date;
    }>;
  };
  insights: {
    topFailureReasons: Array<{ reason: string; count: number; percentage: number }>;
    improvementSuggestions: string[];
    qualityTrends: 'improving' | 'declining' | 'stable';
    riskFactors: string[];
  };
  compliance: {
    auditTrail: Array<{
      action: string;
      timestamp: Date;
      details: string;
    }>;
    dataRetention: {
      policy: string;
      retentionPeriod: number;
      nextCleanup: Date;
    };
  };
}

function getDateRange(period: string, startDate?: string, endDate?: string): { start: Date; end: Date } {
  const end = endDate ? new Date(endDate) : new Date();
  let start: Date;

  switch (period) {
    case 'day':
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = startDate ? new Date(startDate) : new Date(0);
  }

  return { start, end };
}

function filterTestResults(results: EmailTestResult[], dateRange: { start: Date; end: Date }): EmailTestResult[] {
  return results.filter(result => {
    const resultDate = new Date(result.executedAt);
    return resultDate >= dateRange.start && resultDate <= dateRange.end;
  });
}

function calculateTrendData(
  results: EmailTestResult[],
  aggregation: string,
  dateRange: { start: Date; end: Date }
): TrendDataPoint[] {
  const trends: TrendDataPoint[] = [];
  const groupedData: Record<string, EmailTestResult[]> = {};

  // Group results by time period
  results.forEach(result => {
    const date = new Date(result.executedAt);
    let groupKey: string;

    switch (aggregation) {
      case 'hourly':
        groupKey = `${date.toISOString().substring(0, 13)}:00:00Z`;
        break;
      case 'daily':
        groupKey = date.toISOString().substring(0, 10);
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        groupKey = weekStart.toISOString().substring(0, 10);
        break;
      case 'monthly':
        groupKey = date.toISOString().substring(0, 7);
        break;
      default:
        groupKey = date.toISOString().substring(0, 10);
    }

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = [];
    }
    groupedData[groupKey].push(result);
  });

  // Calculate metrics for each group
  Object.entries(groupedData).forEach(([dateKey, groupResults]) => {
    const testsRun = groupResults.length;
    const successfulTests = groupResults.filter(r => r.status === 'pass').length;
    const successRate = testsRun > 0 ? successfulTests / testsRun : 0;

    // Calculate average accuracy from validation results
    const accuracyScores = groupResults
      .map(r => r.validationResults?.filter(v => v.match).length || 0)
      .map((matches, index) => {
        const totalFields = groupResults[index].validationResults?.length || 1;
        return matches / totalFields;
      });
    const accuracy = accuracyScores.length > 0
      ? accuracyScores.reduce((sum, acc) => sum + acc, 0) / accuracyScores.length
      : 0;

    const avgProcessingTime = groupResults.reduce((sum, r) => sum + r.performance.totalTime, 0) / testsRun;
    const failureRate = 1 - successRate;

    trends.push({
      date: dateKey,
      successRate: Math.round(successRate * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      testsRun,
      avgProcessingTime: Math.round(avgProcessingTime),
      failureRate: Math.round(failureRate * 100) / 100
    });
  });

  return trends.sort((a, b) => a.date.localeCompare(b.date));
}

function analyzeInsights(results: EmailTestResult[], testCases: any[]): AnalyticsResult['insights'] {
  const failedResults = results.filter(r => r.status === 'fail');
  const failureReasons: Record<string, number> = {};

  // Analyze failure reasons
  failedResults.forEach(result => {
    const reason = result.errorDetails || 'Unknown error';
    failureReasons[reason] = (failureReasons[reason] || 0) + 1;
  });

  const topFailureReasons = Object.entries(failureReasons)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / failedResults.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate improvement suggestions
  const improvementSuggestions: string[] = [];
  const overallSuccessRate = results.filter(r => r.status === 'pass').length / results.length;

  if (overallSuccessRate < 0.8) {
    improvementSuggestions.push('Overall success rate is below 80%. Consider reviewing test case complexity and email parsing logic.');
  }

  if (topFailureReasons.some(f => f.reason.includes('timeout'))) {
    improvementSuggestions.push('Timeout issues detected. Consider increasing timeout limits or optimizing processing speed.');
  }

  if (topFailureReasons.some(f => f.reason.includes('parsing'))) {
    improvementSuggestions.push('Email parsing errors found. Review and improve extraction patterns and templates.');
  }

  // Determine quality trends
  const recentResults = results.slice(-10);
  const olderResults = results.slice(-20, -10);

  let qualityTrends: 'improving' | 'declining' | 'stable' = 'stable';

  if (recentResults.length > 0 && olderResults.length > 0) {
    const recentSuccessRate = recentResults.filter(r => r.status === 'pass').length / recentResults.length;
    const olderSuccessRate = olderResults.filter(r => r.status === 'pass').length / olderResults.length;

    if (recentSuccessRate > olderSuccessRate + 0.1) {
      qualityTrends = 'improving';
    } else if (recentSuccessRate < olderSuccessRate - 0.1) {
      qualityTrends = 'declining';
    }
  }

  // Identify risk factors
  const riskFactors: string[] = [];

  if (overallSuccessRate < 0.6) {
    riskFactors.push('Low success rate indicates systematic issues with email processing');
  }

  const avgProcessingTime = results.reduce((sum, r) => sum + r.performance.totalTime, 0) / results.length;
  if (avgProcessingTime > 30000) {
    riskFactors.push('High processing times may impact user experience and system performance');
  }

  if (failedResults.length > results.length * 0.3) {
    riskFactors.push('High failure rate suggests need for immediate attention to email parsing logic');
  }

  return {
    topFailureReasons,
    improvementSuggestions,
    qualityTrends,
    riskFactors
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const requestData: AnalyticsRequest = await request.json();
    const { clientId } = await params;

    // Get client with test data
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const testResults = client.emailTesting?.testResults || [];
    const testCases = client.emailTesting?.testCases || [];

    if (testResults.length === 0) {
      return NextResponse.json({
        summary: {
          totalTests: 0,
          overallSuccessRate: 0,
          averageAccuracy: 0,
          averageProcessingTime: 0,
          totalFailures: 0
        },
        trends: [],
        breakdown: { byStatus: {}, byDifficulty: {}, byCategory: {}, byTimeRange: {} },
        performance: {
          averageEmailDeliveryTime: 0,
          averageAIProcessingTime: 0,
          averageTotalTime: 0,
          slowestTests: []
        },
        insights: {
          topFailureReasons: [],
          improvementSuggestions: ['No test data available yet'],
          qualityTrends: 'stable' as const,
          riskFactors: []
        },
        compliance: {
          auditTrail: [],
          dataRetention: {
            policy: 'Default retention policy',
            retentionPeriod: 90,
            nextCleanup: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        }
      });
    }

    // Get date range for filtering
    const dateRange = getDateRange(requestData.period, requestData.startDate, requestData.endDate);
    const filteredResults = filterTestResults(testResults, dateRange);

    // Calculate summary metrics
    const totalTests = filteredResults.length;
    const successfulTests = filteredResults.filter(r => r.status === 'pass').length;
    const overallSuccessRate = totalTests > 0 ? successfulTests / totalTests : 0;

    const accuracyScores = filteredResults.map(r => {
      const matches = r.validationResults?.filter(v => v.match).length || 0;
      const totalFields = r.validationResults?.length || 1;
      return matches / totalFields;
    });
    const averageAccuracy = accuracyScores.length > 0
      ? accuracyScores.reduce((sum, acc) => sum + acc, 0) / accuracyScores.length
      : 0;

    const averageProcessingTime = filteredResults.reduce((sum, r) => sum + r.performance.totalTime, 0) / totalTests;
    const totalFailures = filteredResults.filter(r => r.status === 'fail').length;
    const lastTestRun = filteredResults.length > 0
      ? new Date(Math.max(...filteredResults.map(r => new Date(r.executedAt).getTime())))
      : undefined;

    // Calculate trend data
    const trends = calculateTrendData(
      filteredResults,
      requestData.aggregation || 'daily',
      dateRange
    );

    // Calculate breakdowns
    const breakdown = {
      byStatus: filteredResults.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      byDifficulty: testCases.reduce((acc: any, tc: any) => {
        const difficulty = tc.metadata?.difficulty || 'unknown';
        const relatedResults = filteredResults.filter(r => r.testCaseId === tc.id);
        const successfulResults = relatedResults.filter(r => r.status === 'pass').length;

        acc[difficulty] = {
          count: relatedResults.length,
          successRate: relatedResults.length > 0 ? successfulResults / relatedResults.length : 0
        };
        return acc;
      }, {} as Record<string, { count: number; successRate: number }>),

      byCategory: testCases.reduce((acc: any, tc: any) => {
        const category = tc.category || 'uncategorized';
        const relatedResults = filteredResults.filter(r => r.testCaseId === tc.id);
        const successfulResults = relatedResults.filter(r => r.status === 'pass').length;

        acc[category] = {
          count: relatedResults.length,
          successRate: relatedResults.length > 0 ? successfulResults / relatedResults.length : 0
        };
        return acc;
      }, {} as Record<string, { count: number; successRate: number }>),

      byTimeRange: {} // Could be implemented for hourly/daily distribution
    };

    // Calculate performance metrics
    const performance = {
      averageEmailDeliveryTime: filteredResults.reduce((sum, r) => sum + r.performance.emailDeliveryTime, 0) / totalTests,
      averageAIProcessingTime: filteredResults.reduce((sum, r) => sum + r.performance.aiProcessingTime, 0) / totalTests,
      averageTotalTime: averageProcessingTime,
      slowestTests: filteredResults
        .sort((a, b) => b.performance.totalTime - a.performance.totalTime)
        .slice(0, 5)
        .map(r => {
          const testCase = testCases.find((tc: any) => tc.id === r.testCaseId);
          return {
            testCaseId: r.testCaseId,
            name: testCase?.name || 'Unknown Test',
            totalTime: r.performance.totalTime,
            date: r.executedAt
          };
        })
    };

    // Generate insights
    const insights = analyzeInsights(filteredResults, testCases);

    // Compliance data
    const compliance = {
      auditTrail: [
        {
          action: 'Analytics generated',
          timestamp: new Date(),
          details: `Generated analytics for ${totalTests} test results over ${requestData.period} period`
        }
      ],
      dataRetention: {
        policy: 'Retain test results for 90 days',
        retentionPeriod: 90,
        nextCleanup: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    };

    const analyticsResult: AnalyticsResult = {
      summary: {
        totalTests,
        overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        averageProcessingTime: Math.round(averageProcessingTime),
        totalFailures,
        lastTestRun
      },
      trends,
      breakdown,
      performance,
      insights,
      compliance
    };

    return NextResponse.json(analyticsResult);

  } catch (error) {
    console.error('Error generating analytics:', error);
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
    // Return analytics capabilities and options
    return NextResponse.json({
      availablePeriods: ['day', 'week', 'month', 'quarter', 'year', 'all'],
      availableAggregations: ['hourly', 'daily', 'weekly', 'monthly'],
      availableMetrics: [
        'successRate',
        'accuracy',
        'processingTime',
        'failureRate',
        'emailDeliveryTime',
        'aiProcessingTime'
      ],
      defaultRetentionPeriod: 90,
      supportedExports: ['json', 'csv', 'pdf'],
      realTimeCapabilities: true,
      complianceFeatures: {
        auditTrail: true,
        dataRetention: true,
        gdprCompliant: true
      }
    });

  } catch (error) {
    console.error('Error fetching analytics info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}