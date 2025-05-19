import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    await connectDB();
    const params = await context.params;
    const { clientId } = params;
    const client = await Client.findById(clientId).select('detailsRequired');
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ detailsRequired: client.detailsRequired });
  } catch (error) {
    console.error('Error fetching client config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  await connectDB();
  const params = await context.params;
  const { clientId } = params;
  // ... existing code ...
} 