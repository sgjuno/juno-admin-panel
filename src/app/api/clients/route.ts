import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

interface ClientError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

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

    // Auto-generate a unique placeholder for enquireEmail if missing/null/empty
    if (!data.enquireEmail) {
      data.enquireEmail = `placeholder-${Date.now()}@noemail.com`;
    }
    
    const client = await Client.create(data);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    const clientError = error as ClientError;
    const errorMessage = clientError.message || 'Error creating client';
    const status = clientError.code === 11000 ? 409 : 400; // 409 for duplicate key errors
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 