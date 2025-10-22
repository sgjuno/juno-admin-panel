import { NextRequest, NextResponse } from 'next/server';
import Client from '@/models/Client';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EmailTestCase } from '@/types/Client';

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

    // Get client with test cases
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const testCases = client.emailTesting?.testCases || [];

    return NextResponse.json({
      testCases,
      totalCount: testCases.length
    });

  } catch (error) {
    console.error('Error fetching test cases:', error);
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

    const testCaseData = await request.json() as Omit<EmailTestCase, 'id' | 'createdAt' | 'updatedAt'>;
    const { clientId } = await params;

    // Validate required fields
    if (!testCaseData.name || !testCaseData.emailTemplate) {
      return NextResponse.json(
        { error: 'Missing required fields: name and emailTemplate' },
        { status: 400 }
      );
    }

    // Get client
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create new test case
    const newTestCase: EmailTestCase = {
      ...testCaseData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        difficulty: testCaseData.metadata?.difficulty || 'medium',
        successRate: 0,
        averageAccuracy: 0,
        ...testCaseData.metadata
      }
    };

    // Add test case to client
    await Client.findByIdAndUpdate(
      clientId,
      {
        $push: {
          'emailTesting.testCases': newTestCase
        },
        $set: {
          'emailTesting.isEnabled': true // Enable testing when first test case is added
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      testCase: newTestCase
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating test case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { testCaseId, ...updateData } = await request.json();
    const { clientId } = await params;

    if (!testCaseId) {
      return NextResponse.json(
        { error: 'Test case ID is required' },
        { status: 400 }
      );
    }

    // Update test case
    const result = await Client.findOneAndUpdate(
      {
        _id: clientId,
        'emailTesting.testCases.id': testCaseId
      },
      {
        $set: {
          'emailTesting.testCases.$.name': updateData.name,
          'emailTesting.testCases.$.description': updateData.description,
          'emailTesting.testCases.$.category': updateData.category,
          'emailTesting.testCases.$.emailTemplate': updateData.emailTemplate,
          'emailTesting.testCases.$.expectedExtraction': updateData.expectedExtraction,
          'emailTesting.testCases.$.metadata': updateData.metadata,
          'emailTesting.testCases.$.updatedAt': new Date()
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating test case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const testCaseId = searchParams.get('testCaseId');
    const { clientId } = await params;

    if (!testCaseId) {
      return NextResponse.json(
        { error: 'Test case ID is required' },
        { status: 400 }
      );
    }

    // Remove test case
    const result = await Client.findByIdAndUpdate(
      clientId,
      {
        $pull: {
          'emailTesting.testCases': { id: testCaseId }
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting test case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}