import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: gmail_v1.Schema$MessagePart;
  internalDate: string;
  historyId: string;
  sizeEstimate: number;
}

export interface EmailContent {
  to: string;
  from: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface EmailTestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryTime?: number;
}

export class GmailOAuthService {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;

  constructor() {
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3003/api/auth/google/callback'
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthUrl(state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    return {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined,
    };
  }

  /**
   * Set credentials from stored tokens
   */
  setCredentials(tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  }): void {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials.access_token!;
  }

  /**
   * Send an email for testing purposes
   */
  async sendTestEmail(emailContent: EmailContent): Promise<EmailTestResult> {
    const startTime = Date.now();

    try {
      // Create the email message
      const message = this.createEmailMessage(emailContent);

      // Send the email
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      const deliveryTime = Date.now() - startTime;

      return {
        success: true,
        messageId: response.data.id || undefined,
        deliveryTime,
      };
    } catch (error) {
      console.error('Failed to send test email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get messages from inbox with optional filtering
   */
  async getMessages(options: {
    query?: string;
    maxResults?: number;
    pageToken?: string;
  } = {}): Promise<{ messages: GmailMessage[]; nextPageToken?: string }> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: options.query,
        maxResults: options.maxResults || 10,
        pageToken: options.pageToken,
      });

      if (!response.data.messages) {
        return { messages: [] };
      }

      // Get full message details
      const messages = await Promise.all(
        response.data.messages.map(async (message) => {
          const fullMessage = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
          });
          return fullMessage.data as GmailMessage;
        })
      );

      return {
        messages,
        nextPageToken: response.data.nextPageToken || undefined,
      };
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw new Error('Failed to retrieve messages');
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(messageId: string): Promise<GmailMessage> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      return response.data as GmailMessage;
    } catch (error) {
      console.error('Failed to get message:', error);
      throw new Error('Failed to retrieve message');
    }
  }

  /**
   * Search for messages with specific criteria
   */
  async searchMessages(query: string, maxResults: number = 10): Promise<GmailMessage[]> {
    const result = await this.getMessages({ query, maxResults });
    return result.messages;
  }

  /**
   * Extract text content from message payload
   */
  extractTextContent(message: GmailMessage): string {
    const extractFromParts = (parts: gmail_v1.Schema$MessagePart[]): string => {
      let text = '';

      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          text += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data && !text) {
          // Use HTML as fallback if no plain text found
          text += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          text += extractFromParts(part.parts);
        }
      }

      return text;
    };

    if (message.payload.body?.data) {
      return Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      return extractFromParts(message.payload.parts);
    }

    return message.snippet || '';
  }

  /**
   * Extract headers from message
   */
  extractHeaders(message: GmailMessage): Record<string, string> {
    const headers: Record<string, string> = {};

    if (message.payload.headers) {
      for (const header of message.payload.headers) {
        if (header.name && header.value) {
          headers[header.name.toLowerCase()] = header.value;
        }
      }
    }

    return headers;
  }

  /**
   * Create RFC 2822 formatted email message
   */
  private createEmailMessage(emailContent: EmailContent): string {
    const boundary = 'boundary_' + Date.now();
    let message = '';

    // Headers
    message += `To: ${emailContent.to}\n`;
    message += `From: ${emailContent.from}\n`;
    message += `Subject: ${emailContent.subject}\n`;
    message += `MIME-Version: 1.0\n`;

    if (emailContent.attachments && emailContent.attachments.length > 0) {
      message += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`;

      // Email body
      message += `--${boundary}\n`;
      message += `Content-Type: text/html; charset=UTF-8\n\n`;
      message += `${emailContent.body}\n\n`;

      // Attachments
      for (const attachment of emailContent.attachments) {
        message += `--${boundary}\n`;
        message += `Content-Type: ${attachment.contentType}\n`;
        message += `Content-Disposition: attachment; filename="${attachment.filename}"\n`;
        message += `Content-Transfer-Encoding: base64\n\n`;
        message += attachment.content.toString('base64') + '\n\n';
      }

      message += `--${boundary}--`;
    } else {
      message += `Content-Type: text/html; charset=UTF-8\n\n`;
      message += emailContent.body;
    }

    // Encode the message in base64url format
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  /**
   * Get user profile information
   */
  async getProfile(): Promise<gmail_v1.Schema$Profile> {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me',
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }
}

// Export a singleton instance
export const gmailOAuthService = new GmailOAuthService();