import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JunoDatapoint from '@/models/JunoDatapoint';

export async function GET() {
  await connectDB();
  const datapoints = await JunoDatapoint.find({}).sort({ category: 1, id: 1 });
  return NextResponse.json(datapoints);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  try {
    const created = await JunoDatapoint.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 