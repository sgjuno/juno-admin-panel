import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET(request: NextRequest, { params }: { params: { clientId: string } }) {
  await connectDB();
  const { clientId } = params;
  const client = await Client.findById(clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json(client);
}

export async function PUT(request: NextRequest, { params }: { params: { clientId: string } }) {
  await connectDB();
  const { clientId } = params;
  let data;
  try {
    data = await request.json();
    console.log('Incoming PUT /api/clients/[clientId] data:', data);
    const client = await Client.findByIdAndUpdate(clientId, { $set: data }, { new: true });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client', details: error instanceof Error ? error.message : error }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { clientId: string } }) {
  await connectDB();
  const { clientId } = params;
  const client = await Client.findByIdAndDelete(clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Client deleted successfully' });
} 