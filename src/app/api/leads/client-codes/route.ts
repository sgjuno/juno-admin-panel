import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function GET() {
  await connectDB();
  const codes = await Lead.distinct('clientCode');
  return NextResponse.json(codes);
} 