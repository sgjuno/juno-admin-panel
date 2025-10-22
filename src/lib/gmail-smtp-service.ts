import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export interface EmailContent {
  to: string;
  from?: string;
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

export class GmailSMTPService {
  private transporter: Mail;

  constructor() {
    // Create reusable transporter using Gmail SMTP
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER!, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD! // App-specific password
      }
    });
  }

  /**
   * Send an email for testing purposes
   */
  async sendTestEmail(emailContent: EmailContent): Promise<EmailTestResult> {
    const startTime = Date.now();

    try {
      // Prepare email options
      const mailOptions: Mail.Options = {
        from: emailContent.from || process.env.GMAIL_USER,
        to: emailContent.to,
        subject: emailContent.subject,
        html: emailContent.body,
        attachments: emailContent.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      const deliveryTime = Date.now() - startTime;

      return {
        success: true,
        messageId: info.messageId,
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
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gmailSMTPService = new GmailSMTPService();