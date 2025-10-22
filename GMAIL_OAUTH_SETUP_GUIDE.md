# Gmail OAuth Setup Guide (Without Domain-Wide Delegation)

This guide helps you set up Gmail API integration using OAuth2 authentication when you don't have domain-wide delegation permissions.

## Overview

Instead of using a service account with domain-wide delegation, this approach uses OAuth2 where users authorize the app to access their Gmail account.

## Prerequisites

- Google Cloud Console access
- Gmail account for testing
- Admin panel deployed and running

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

## Step 2: Enable Gmail API

1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - **Application name**: "Juno Email Testing"
   - **User support email**: Your email
   - **Scopes**: Add these Gmail scopes:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - **Test users**: Add emails that will use the testing feature

4. For the OAuth client:
   - **Application type**: Web application
   - **Name**: "Juno Admin Panel"
   - **Authorized JavaScript origins**:
     - `http://localhost:3003` (for development)
     - Your production URL
   - **Authorized redirect URIs**:
     - `http://localhost:3003/api/auth/google/callback`
     - `https://yourdomain.com/api/auth/google/callback`

5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 4: Environment Variables

Add these to your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3003/api/auth/google/callback

# Optional
GOOGLE_PROJECT_ID=your-project-id
```

## Step 5: Update Database Schema

The client model needs additional fields for OAuth tokens. Add these to your schema:

```typescript
emailTesting: {
  gmailConfig: {
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Number,
    isAuthorized: Boolean,
    authorizedEmail: String
  }
}
```

## Step 6: Authorization Flow

### For QA Team Members:

1. Navigate to a client's Email Testing page
2. Click "Authorize Gmail Access" button
3. You'll be redirected to Google's OAuth consent screen
4. Select the Gmail account to use for testing
5. Grant the requested permissions
6. You'll be redirected back to the admin panel

### Implementation in UI:

```typescript
// Add authorization button to Email Testing page
const handleGmailAuth = () => {
  // Redirect to OAuth authorization endpoint
  window.location.href = `/api/auth/google/authorize?clientId=${clientId}`;
};
```

## Step 7: Create Authorization Endpoint

Create `/api/auth/google/authorize/route.ts`:

```typescript
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
```

## Step 8: Alternative Approaches

### Option A: Shared Test Account
Create a dedicated Gmail account for testing that all QA team members can authorize:

1. Create `juno-testing@yourdomain.com`
2. Each QA member authorizes this account once
3. Tokens are stored per client in the database

### Option B: Individual QA Accounts
Each QA team member uses their own Gmail account:

1. QA members authorize their personal work email
2. Better for audit trails and accountability
3. Requires each member to go through OAuth flow

### Option C: Simple SMTP (Easiest)
For basic email sending without reading capabilities:

```typescript
// Use Nodemailer with Gmail SMTP
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
  }
});
```

To get Gmail App Password:
1. Go to Google Account settings
2. Security > 2-Step Verification (must be enabled)
3. App passwords > Generate new
4. Use this password in your env variables

## Comparison of Approaches

| Feature | OAuth2 | Service Account | SMTP |
|---------|---------|----------------|------|
| Send Emails | ✅ | ✅ | ✅ |
| Read Emails | ✅ | ✅ | ❌ |
| Monitor Inbox | ✅ | ✅ | ❌ |
| User Authorization | Required | Not Required | Not Required |
| Setup Complexity | Medium | High | Low |
| Best For | Individual accounts | Domain-wide access | Simple sending |

## Troubleshooting

### Common Issues

1. **"Access blocked" error**
   - Ensure app is in testing mode or published
   - Add test users to OAuth consent screen

2. **"Refresh token not returned"**
   - Include `access_type: 'offline'` in auth URL
   - Add `prompt: 'consent'` to force consent screen

3. **Token expiration**
   - Implement automatic token refresh using refresh token
   - Store refresh tokens securely

4. **Rate limiting**
   - Gmail API has quotas (250 quota units per user per second)
   - Implement exponential backoff for retries

## Security Considerations

1. **Token Storage**: Encrypt OAuth tokens before storing in database
2. **Refresh Tokens**: Never expose refresh tokens to frontend
3. **Scope Limitation**: Only request necessary Gmail scopes
4. **Token Rotation**: Regularly refresh access tokens
5. **Audit Logging**: Log all email operations for compliance

## Production Deployment

1. Update redirect URIs in Google Cloud Console
2. Set production environment variables
3. Ensure HTTPS for OAuth callbacks
4. Implement token encryption
5. Set up monitoring for token expiration

## Next Steps

After setup:
1. Test the authorization flow
2. Verify email sending works
3. Test inbox monitoring
4. Set up automated token refresh
5. Train QA team on the authorization process

---

**Note**: This OAuth approach requires each user to authorize access, but provides full Gmail API functionality without needing domain-wide delegation permissions.