import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JunoDatapoint from '@/models/JunoDatapoint';

interface DatapointError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

export async function GET() {
  await connectDB();
  const datapoints = await JunoDatapoint.find({}).sort({ category: 1, id: 1 });
  return NextResponse.json(datapoints);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await JunoDatapoint.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const datapointError = error as DatapointError;
    const errorMessage = datapointError.message || 'Error creating datapoint';
    const status = datapointError.code === 11000 ? 409 : 400; // 409 for duplicate key errors
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 