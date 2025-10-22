import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';
  const clientCodes = url.searchParams.getAll('clientCode');
  const createdFrom = url.searchParams.get('createdFrom');
  const createdTo = url.searchParams.get('createdTo');
  const updatedFrom = url.searchParams.get('updatedFrom');
  const updatedTo = url.searchParams.get('updatedTo');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

  // Build filter
  const filter: any = {};
  if (search) {
    filter.$or = [
      { clientCode: { $regex: search, $options: 'i' } },
      { threadId: { $regex: search, $options: 'i' } },
      { status: { $regex: search, $options: 'i' } },
    ];
  }
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (clientCodes.length > 0) {
    filter.clientCode = { $in: clientCodes };
  }
  if (createdFrom || createdTo) {
    filter.createdAt = {};
    if (createdFrom) filter.createdAt.$gte = Number(createdFrom);
    if (createdTo) filter.createdAt.$lte = Number(createdTo);
  }
  if (updatedFrom || updatedTo) {
    filter.updatedAt = {};
    if (updatedFrom) filter.updatedAt.$gte = Number(updatedFrom);
    if (updatedTo) filter.updatedAt.$lte = Number(updatedTo);
  }

  const skip = (page - 1) * pageSize;
  const total = await Lead.countDocuments(filter);
  const leads = await Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize);
  return NextResponse.json({ leads, total });
} 