import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    await connectDB();
    const client = await Client.findById(params.clientId).select('detailsRequired');
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