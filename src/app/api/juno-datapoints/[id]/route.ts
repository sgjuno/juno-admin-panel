import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JunoDatapoint from '@/models/JunoDatapoint';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const datapoint = await JunoDatapoint.findById(id);
  if (!datapoint) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(datapoint), { status: 200 });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const body = await req.json();
  try {
    const updated = await JunoDatapoint.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  try {
    const deleted = await JunoDatapoint.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 