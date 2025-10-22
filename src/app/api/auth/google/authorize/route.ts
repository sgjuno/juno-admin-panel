import { NextRequest, NextResponse } from 'next/server';
import { gmailOAuthService } from '@/lib/gmail-oauth-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  // Generate OAuth URL with clientId as state
  const authUrl = gmailOAuthService.getAuthUrl(clientId);

  return NextResponse.redirect(authUrl);
}