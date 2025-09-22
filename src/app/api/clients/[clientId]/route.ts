import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  await connectDB();
  const params = await context.params;
  const { clientId } = params;
  const client = await Client.findById(clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json(client);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  await connectDB();
  const params = await context.params;
  const { clientId } = params;
  const data = await request.json();
  console.log('Incoming client update data:', JSON.stringify(data, null, 2));
  
  // Build update object based on what's being updated
  const updateData: any = {};
  
  // Basic fields
  if (data.companyName !== undefined) updateData.companyName = data.companyName;
  if (data.pocName !== undefined) updateData.pocName = data.pocName;
  if (data.pocContact !== undefined) updateData.pocContact = data.pocContact;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.companyNumber !== undefined) updateData.companyNumber = data.companyNumber;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.onboardedAt !== undefined) updateData.onboardedAt = data.onboardedAt;
  if (data.createdAt !== undefined) updateData.createdAt = data.createdAt;
  if (data.updatedAt !== undefined) updateData.updatedAt = data.updatedAt;
  if (data.carFinanceDomain !== undefined) updateData.carFinanceDomain = data.carFinanceDomain;
  if (data.propertyFinanceDomain !== undefined) updateData.propertyFinanceDomain = data.propertyFinanceDomain;
  if (data.smeFinanceDomain !== undefined) updateData.smeFinanceDomain = data.smeFinanceDomain;
  if (data.clientCode !== undefined) updateData.clientCode = data.clientCode;
  if (data.emailDomain !== undefined) updateData.emailDomain = data.emailDomain;
  if (data.nylasGrantId !== undefined) updateData.nylasGrantId = data.nylasGrantId;
  if (data.emailAction !== undefined) updateData.emailAction = data.emailAction;
  if (data.adminEmail !== undefined) updateData.adminEmail = data.adminEmail;
  if (data.enquireEmail !== undefined) updateData.enquireEmail = data.enquireEmail;
  
  // Complex fields
  if (data.responsePrompts !== undefined) updateData.responsePrompts = data.responsePrompts;
  if (data.followUpConfig !== undefined) updateData.followUpConfig = data.followUpConfig;
  if (data.feature_flags !== undefined) updateData.feature_flags = data.feature_flags;
  if (data.unified !== undefined) updateData.unified = data.unified;
  if (data.bankStatementValidationConfig !== undefined) updateData.bankStatementValidationConfig = data.bankStatementValidationConfig;
  if (data.ruleCriteria !== undefined) updateData.ruleCriteria = data.ruleCriteria;
  if (data.indicativeTermsCalcVariables !== undefined) updateData.indicativeTermsCalcVariables = data.indicativeTermsCalcVariables;
  if (data.whitelistedDomains !== undefined) updateData.whitelistedDomains = data.whitelistedDomains;
  if (data.auditJobMetadata !== undefined) updateData.auditJobMetadata = data.auditJobMetadata;
  if (data.pandaDoc !== undefined) updateData.pandaDoc = data.pandaDoc;
  if (data.vectorDbParams !== undefined) updateData.vectorDbParams = data.vectorDbParams;
  if (data.requiredDocuments !== undefined) updateData.requiredDocuments = data.requiredDocuments;
  if (data.detailsRequired !== undefined) updateData.detailsRequired = data.detailsRequired;
  
  console.log('Update data to be applied:', JSON.stringify(updateData, null, 2));
  
  try {
    const client = await Client.findByIdAndUpdate(clientId, { $set: updateData }, { new: true });
    console.log('Updated client after save - ruleCriteria:', JSON.stringify(client?.ruleCriteria, null, 2));
    
    if (!client) {
      console.error('Client not found during update');
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(client);
  } catch (mongoError) {
    console.error('MongoDB update error:', mongoError);
    return NextResponse.json({ error: 'Database update failed', details: (mongoError as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  await connectDB();
  const params = await context.params;
  const { clientId } = params;
  const client = await Client.findByIdAndDelete(clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Client deleted successfully' });
} 