import { NextRequest, NextResponse } from 'next/server';
import { gmailService } from '@/lib/gmail-service';
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

    const query = searchParams.get('query') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const pageToken = searchParams.get('pageToken') || undefined;

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

    // Build search query to filter emails from this client's domain
    let searchQuery = query;
    if (client.enquireEmail) {
      const domain = client.enquireEmail.split('@')[1];
      searchQuery = query ? `${query} from:${domain}` : `from:${domain}`;
    }

    // Get messages from Gmail
    const result = await gmailService.getMessages({
      query: searchQuery,
      maxResults,
      pageToken
    });

    // Extract message details
    const messages = result.messages.map(message => {
      const headers = gmailService.extractHeaders(message);
      const textContent = gmailService.extractTextContent(message);

      return {
        id: message.id,
        threadId: message.threadId,
        subject: headers.subject || 'No Subject',
        from: headers.from || 'Unknown Sender',
        to: headers.to || 'Unknown Recipient',
        date: headers.date || message.internalDate,
        snippet: message.snippet,
        textContent: textContent.substring(0, 500), // Truncate for API response
        labelIds: message.labelIds,
        isUnread: message.labelIds?.includes('UNREAD') || false
      };
    });

    return NextResponse.json({
      messages,
      nextPageToken: result.nextPageToken,
      totalCount: messages.length
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
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

    const { messageId, action } = await request.json();
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

    // Perform the requested action
    switch (action) {
      case 'markAsRead':
        await gmailService.markAsRead(messageId);
        break;

      case 'addLabel':
        const { labelId } = await request.json();
        if (labelId) {
          await gmailService.addLabel(messageId, labelId);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error performing message action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}