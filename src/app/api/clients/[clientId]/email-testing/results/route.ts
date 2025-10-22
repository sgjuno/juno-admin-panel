import { NextRequest, NextResponse } from 'next/server';
import Client from '@/models/Client';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { clientId } = await params;
    const { searchParams } = new URL(request.url);

    const testCaseId = searchParams.get('testCaseId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get client with test results
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    let testResults = client.emailTesting?.testResults || [];

    // Filter by test case ID if provided
    if (testCaseId) {
      testResults = testResults.filter((result: any) => result.testCaseId === testCaseId);
    }

    // Filter by status if provided
    if (status && ['pass', 'fail', 'partial'].includes(status)) {
      testResults = testResults.filter((result: any) => result.status === status);
    }

    // Sort by execution date (most recent first)
    testResults.sort((a: any, b: any) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());

    // Apply pagination
    const paginatedResults = testResults.slice(offset, offset + limit);

    // Calculate analytics
    const analytics = {
      totalResults: testResults.length,
      passRate: testResults.length > 0 ?
        (testResults.filter((r: any) => r.status === 'pass').length / testResults.length) * 100 : 0,
      averageAccuracy: testResults.length > 0 ?
        testResults.reduce((sum: number, result: any) => {
          const accuracy = result.validationResults.length > 0 ?
            (result.validationResults.filter((v: any) => v.match).length / result.validationResults.length) * 100 : 0;
          return sum + accuracy;
        }, 0) / testResults.length : 0,
      averageProcessingTime: testResults.length > 0 ?
        testResults.reduce((sum: number, result: any) => sum + result.performance.totalTime, 0) / testResults.length : 0
    };

    return NextResponse.json({
      results: paginatedResults,
      analytics,
      pagination: {
        total: testResults.length,
        limit,
        offset,
        hasMore: offset + limit < testResults.length
      }
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const { testResultId, aiExtraction, validationResults } = await request.json();
    const { clientId } = await params;

    if (!testResultId) {
      return NextResponse.json(
        { error: 'Test result ID is required' },
        { status: 400 }
      );
    }

    // Calculate validation status
    const passedValidations = validationResults.filter((v: any) => v.match).length;
    const totalValidations = validationResults.length;
    const accuracy = totalValidations > 0 ? (passedValidations / totalValidations) * 100 : 0;

    let status: 'pass' | 'fail' | 'partial';
    if (accuracy >= 90) {
      status = 'pass';
    } else if (accuracy >= 50) {
      status = 'partial';
    } else {
      status = 'fail';
    }

    // Update test result with AI extraction and validation results
    const result = await Client.findOneAndUpdate(
      {
        _id: clientId,
        'emailTesting.testResults.id': testResultId
      },
      {
        $set: {
          'emailTesting.testResults.$.responseReceived': true,
          'emailTesting.testResults.$.aiExtraction': aiExtraction,
          'emailTesting.testResults.$.validationResults': validationResults,
          'emailTesting.testResults.$.status': status,
          'emailTesting.testResults.$.performance.aiProcessingTime': Date.now() // This should be calculated properly
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      );
    }

    // Update client analytics
    const allResults = result.emailTesting?.testResults || [];
    const totalTests = allResults.length;
    const passedTests = allResults.filter((r: any) => r.status === 'pass').length;
    const overallSuccessRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const totalAccuracy = allResults.reduce((sum: number, res: any) => {
      const resultAccuracy = res.validationResults.length > 0 ?
        (res.validationResults.filter((v: any) => v.match).length / res.validationResults.length) * 100 : 0;
      return sum + resultAccuracy;
    }, 0);
    const averageAccuracy = totalTests > 0 ? totalAccuracy / totalTests : 0;

    await Client.findByIdAndUpdate(
      clientId,
      {
        $set: {
          'emailTesting.analytics.overallSuccessRate': overallSuccessRate,
          'emailTesting.analytics.averageAccuracy': averageAccuracy
        }
      }
    );

    return NextResponse.json({
      success: true,
      status,
      accuracy
    });

  } catch (error) {
    console.error('Error updating test result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}