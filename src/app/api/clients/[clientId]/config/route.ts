import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

interface RouteContext {
  params: {
    clientId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();
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