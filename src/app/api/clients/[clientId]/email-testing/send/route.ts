import { NextRequest, NextResponse } from 'next/server';
import { gmailService } from '@/lib/gmail-service';
import Client from '@/models/Client';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface SendEmailRequest {
  testCaseId: string;
  emailTemplate: {
    subject: string;
    body: string;
    attachments?: Array<{
      filename: string;
      contentType: string;
      content: string; // base64 encoded
    }>;
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

    const { testCaseId, emailTemplate } = await request.json() as SendEmailRequest;
    const { clientId } = await params;

    // Get client configuration
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.emailTesting?.isEnabled) {
      return NextResponse.json(
        { error: 'Email testing is not enabled for this client' },
        { status: 400 }
      );
    }

    if (!client.enquireEmail) {
      return NextResponse.json(
        { error: 'Client enquiry email not configured' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailContent = {
      to: client.enquireEmail,
      from: client.emailTesting.gmailConfig?.serviceAccountEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      subject: emailTemplate.subject,
      body: emailTemplate.body,
      attachments: emailTemplate.attachments?.map(att => ({
        filename: att.filename,
        contentType: att.contentType,
        content: Buffer.from(att.content, 'base64')
      }))
    };

    // Send email using Gmail service
    const result = await gmailService.sendTestEmail(emailContent);

    // Create test result record
    const testResult = {
      id: uuidv4(),
      testCaseId,
      executedAt: new Date(),
      status: result.success ? 'pass' as const : 'fail' as const,
      emailSent: result.success,
      emailDelivered: result.success, // Assume delivered if sent successfully
      responseReceived: false, // Will be updated when response is received
      aiExtraction: {},
      validationResults: [],
      performance: {
        emailDeliveryTime: result.deliveryTime || 0,
        aiProcessingTime: 0,
        totalTime: result.deliveryTime || 0
      },
      errorDetails: result.error
    };

    // Update client with test result
    await Client.findByIdAndUpdate(
      clientId,
      {
        $push: {
          'emailTesting.testResults': testResult
        },
        $inc: {
          'emailTesting.analytics.totalTestsRun': 1
        },
        $set: {
          'emailTesting.analytics.lastTestRun': new Date()
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: result.success,
      testResultId: testResult.id,
      messageId: result.messageId,
      deliveryTime: result.deliveryTime,
      error: result.error
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}