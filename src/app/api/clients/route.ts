import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET() {
  await connectDB();
  const clients = await Client.find({}).sort({ createdAt: -1 });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Set isActive to false by default for new clients
    data.isActive = false;
    
    // Set onboardedAt to current timestamp
    data.onboardedAt = Date.now();
    
    const client = await Client.create(data);
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error creating client' },
      { status: 400 }
    );
  }
} 