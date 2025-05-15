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
  const data = await request.json();
  const client = await Client.findByIdAndUpdate(clientId, data, { new: true });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json(client);
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