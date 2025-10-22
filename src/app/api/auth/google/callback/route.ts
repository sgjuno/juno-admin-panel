import { NextRequest, NextResponse } from 'next/server';
import { gmailOAuthService } from '@/lib/gmail-oauth-service';
import Client from '@/models/Client';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Contains clientId
    const error = searchParams.get('error');

    // Get base URL for absolute redirects
    const baseUrl = process.env.NEXTAUTH_URL || origin || 'http://localhost:3003';

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/clients?error=oauth_failed', baseUrl));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/clients?error=missing_params', baseUrl));
    }

    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Exchange code for tokens
    const tokens = await gmailOAuthService.getTokensFromCode(code);

    // Parse state to get clientId
    const clientId = state;

    // Set credentials to get user email
    gmailOAuthService.setCredentials(tokens);

    // Get user profile to store authorized email
    let authorizedEmail = '';
    try {
      const profile = await gmailOAuthService.getProfile();
      authorizedEmail = profile.emailAddress || '';
    } catch (profileError) {
      console.error('Failed to get Gmail profile:', profileError);
    }

    // Store tokens in client configuration
    await Client.findByIdAndUpdate(
      clientId,
      {
        $set: {
          'emailTesting.gmailConfig.accessToken': tokens.access_token,
          'emailTesting.gmailConfig.refreshToken': tokens.refresh_token,
          'emailTesting.gmailConfig.tokenExpiry': tokens.expiry_date,
          'emailTesting.gmailConfig.isAuthorized': true,
          'emailTesting.gmailConfig.authorizedEmail': authorizedEmail,
          'emailTesting.isEnabled': true
        }
      }
    );

    // Redirect to client's email testing page
    return NextResponse.redirect(new URL(`/clients/${clientId}/email-testing?success=oauth_complete`, baseUrl));

  } catch (error) {
    console.error('OAuth callback error:', error);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3003';
    return NextResponse.redirect(new URL('/clients?error=oauth_callback_failed', baseUrl));
  }
}