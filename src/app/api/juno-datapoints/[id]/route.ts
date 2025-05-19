import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JunoDatapoint from '@/models/JunoDatapoint';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  const datapoint = await JunoDatapoint.findById(context.params.id);
  if (!datapoint) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(datapoint);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  try {
    const updated = await JunoDatapoint.findByIdAndUpdate(context.params.id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  try {
    const deleted = await JunoDatapoint.findByIdAndDelete(context.params.id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 