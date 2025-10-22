import { NextRequest, NextResponse } from 'next/server';
import Client from '@/models/Client';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EmailTestCase } from '@/types/Client';

interface SyntheticDataRequest {
  scenario: 'lending-application' | 'broker-communication' | 'document-request' | 'follow-up' | 'compliance';
  count: number;
  industry: 'finance' | 'lending' | 'broker';
  complexity: 'simple' | 'medium' | 'complex';
  attachmentTypes?: string[];
  customPrompt?: string;
}

interface SyntheticEmailData {
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: string; // base64 encoded synthetic content
  }>;
  expectedExtraction: Record<string, any>;
  metadata: {
    scenario: string;
    industry: string;
    complexity: string;
    generatedAt: Date;
    syntheticDataId: string;
  };
}

// Synthetic data templates for different scenarios
const SYNTHETIC_TEMPLATES = {
  'lending-application': {
    subjects: [
      'Loan Application - {companyName}',
      'Bridge Finance Request - {amount}',
      'Property Development Funding',
      'Commercial Lending Inquiry',
      'Urgent: Financing Required for {propertyType}'
    ],
    bodyTemplates: [
      `Dear {lenderName},

I am writing to request a {loanType} loan for my client, {applicantName}.

Property Details:
- Address: {propertyAddress}
- Value: £{propertyValue}
- Loan Amount Required: £{loanAmount}
- LTV: {ltv}%
- Purpose: {loanPurpose}

Applicant Information:
- Name: {applicantName}
- Age: {age}
- Employment: {employment}
- Annual Income: £{income}
- Credit Score: {creditScore}

The client requires funding by {requiredDate} for {urgencyReason}.

Please find attached:
- Application form
- Property valuation
- Financial statements

Looking forward to your response.

Best regards,
{brokerName}
{companyName}`,

      `Hi {lenderName},

Quick inquiry for bridge finance:

- Property: {propertyAddress}
- Purchase Price: £{purchasePrice}
- Required: £{loanAmount} ({ltv}% LTV)
- Term: {loanTerm} months
- Exit Strategy: {exitStrategy}
- Client: {applicantName} (income £{income}pa)

Timeline: Exchange {exchangeDate}, completion {completionDate}

Can you provide an indicative rate and decision timeframe?

Thanks,
{brokerName}`
    ],
    expectedFields: [
      'loanAmount', 'propertyValue', 'ltv', 'applicantName',
      'propertyAddress', 'loanPurpose', 'income', 'creditScore'
    ]
  },

  'broker-communication': {
    subjects: [
      'Client Update - {applicantName}',
      'Documentation Required - Application {applicationId}',
      'Rate Confirmation - {propertyAddress}',
      'Valuation Received - {propertyAddress}',
      'Completion Update - {applicationId}'
    ],
    bodyTemplates: [
      `Hi {clientName},

Update on your application {applicationId}:

✅ Application submitted to {lenderName}
✅ Credit check completed
✅ Property valuation ordered
⏳ Awaiting underwriter decision

Current Status: {status}
Expected Decision: {decisionDate}

Next Steps:
1. {nextStep1}
2. {nextStep2}
3. {nextStep3}

Please contact me if you have any questions.

Best regards,
{brokerName}`,

      `Dear {clientName},

Your mortgage application has been approved! 🎉

Loan Details:
- Amount: £{approvedAmount}
- Rate: {interestRate}% (initially)
- Term: {loanTerm} years
- Monthly Payment: £{monthlyPayment}

Next steps:
- Legal pack will be sent within 48 hours
- Solicitor: {solicitorName}
- Target completion: {completionDate}

Congratulations!

{brokerName}
{companyName}`
    ],
    expectedFields: [
      'applicationId', 'status', 'lenderName', 'approvedAmount',
      'interestRate', 'monthlyPayment', 'completionDate'
    ]
  },

  'document-request': {
    subjects: [
      'Documentation Required - {applicantName}',
      'Bank Statements Needed - Application {applicationId}',
      'Missing Documents - Urgent',
      'Additional Information Required',
      'Document Checklist - {propertyAddress}'
    ],
    bodyTemplates: [
      `Dear {clientName},

To proceed with your application {applicationId}, we require the following documents:

Required Documents:
{documentList}

Please provide:
- Last 3 months bank statements (personal and business)
- 2 years SA302/tax calculations
- Latest company accounts (if applicable)
- Proof of deposit source
- Building survey/valuation report

Deadline: {deadline}

You can upload documents securely via: {uploadLink}

Please call if you need any assistance.

Best regards,
{brokerName}`,

      `Hi {clientName},

Quick update - the underwriter has requested additional information:

📄 Required:
{additionalDocuments}

⏰ Deadline: {urgentDeadline}
🔗 Upload here: {uploadPortal}

This is the final requirement before approval. Please prioritize this to avoid delays.

Thanks,
{brokerName}`
    ],
    expectedFields: [
      'applicationId', 'documentList', 'deadline', 'uploadLink',
      'additionalDocuments', 'urgentDeadline'
    ]
  }
};

// Generate realistic synthetic data values
function generateSyntheticValues(scenario: string, complexity: string, industry: string) {
  const baseData = {
    // Names
    applicantName: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson', 'David Jones'][Math.floor(Math.random() * 5)],
    clientName: ['John', 'Sarah', 'Michael', 'Emma', 'David'][Math.floor(Math.random() * 5)],
    brokerName: ['Alex Thompson', 'Lisa Roberts', 'James Miller', 'Katie Davis', 'Robert Taylor'][Math.floor(Math.random() * 5)],
    lenderName: ['MetroBank', 'CityLending', 'PrimeMortgages', 'BridgeFinance Ltd', 'SecureLoans'][Math.floor(Math.random() * 5)],
    companyName: ['ABC Finance', 'Premier Lending', 'Swift Mortgages', 'ProBroker Ltd', 'Elite Finance'][Math.floor(Math.random() * 5)],

    // Property
    propertyAddress: [
      '123 Victoria Street, London SW1E 6DE',
      '45 High Street, Manchester M1 2HQ',
      '78 King Road, Bristol BS1 4EF',
      '12 Queens Avenue, Birmingham B1 2JP',
      '34 Church Lane, Leeds LS1 7AB'
    ][Math.floor(Math.random() * 5)],
    propertyType: ['Residential', 'Commercial', 'Mixed Use', 'Development', 'Buy-to-Let'][Math.floor(Math.random() * 5)],

    // Financial (realistic UK amounts)
    loanAmount: (Math.floor(Math.random() * 800) + 200) * 1000, // £200k-£1M
    propertyValue: (Math.floor(Math.random() * 1000) + 400) * 1000, // £400k-£1.4M
    purchasePrice: (Math.floor(Math.random() * 900) + 300) * 1000, // £300k-£1.2M
    approvedAmount: (Math.floor(Math.random() * 700) + 150) * 1000, // £150k-£850k
    income: (Math.floor(Math.random() * 200) + 50) * 1000, // £50k-£250k
    monthlyPayment: Math.floor(Math.random() * 3000) + 1000, // £1k-£4k

    // Percentages and rates
    ltv: Math.floor(Math.random() * 20) + 65, // 65-85%
    interestRate: (Math.random() * 3 + 4).toFixed(2), // 4-7%
    creditScore: Math.floor(Math.random() * 200) + 650, // 650-850

    // Dates
    requiredDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exchangeDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completionDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    decisionDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgentDeadline: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

    // IDs and references
    applicationId: 'APP' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),

    // Other
    age: Math.floor(Math.random() * 30) + 25, // 25-55
    employment: ['Self-Employed', 'Employed', 'Director', 'Contractor', 'Professional'][Math.floor(Math.random() * 5)],
    loanPurpose: ['Purchase', 'Remortgage', 'Development', 'Refurbishment', 'Investment'][Math.floor(Math.random() * 5)],
    loanType: ['Bridge', 'Development', 'Commercial', 'BTL', 'Residential'][Math.floor(Math.random() * 5)],
    loanTerm: [6, 12, 18, 24, 36][Math.floor(Math.random() * 5)],
    exitStrategy: ['Sale', 'Refinance', 'Let', 'Development Sale'][Math.floor(Math.random() * 4)],
    status: ['Under Review', 'Approved', 'Conditional', 'Pending Documents'][Math.floor(Math.random() * 4)],
    urgencyReason: ['Quick completion needed', 'Chain collapse', 'Auction purchase', 'Market opportunity'][Math.floor(Math.random() * 4)],

    // Documents and links
    documentList: [
      '• 3 months bank statements\n• Proof of income\n• ID documents',
      '• Company accounts (2 years)\n• Management accounts\n• VAT returns',
      '• Property details\n• Building survey\n• Legal pack'
    ][Math.floor(Math.random() * 3)],
    additionalDocuments: [
      'Updated bank statements',
      'Proof of deposit source',
      'Building survey report',
      'Solicitor details'
    ][Math.floor(Math.random() * 4)],
    uploadLink: 'https://secure.portal.example.com/upload',
    uploadPortal: 'https://docs.portal.example.com',

    // Steps
    nextStep1: 'Complete valuation',
    nextStep2: 'Underwriter review',
    nextStep3: 'Offer production',

    // Professional details
    solicitorName: ['Browns Solicitors', 'City Legal', 'Premier Law', 'Swift Legal'][Math.floor(Math.random() * 4)]
  };

  // Calculate dependent values
  baseData.ltv = Math.round((baseData.loanAmount / baseData.propertyValue) * 100);

  return baseData;
}

function generateSyntheticEmail(scenario: string, complexity: string, industry: string): SyntheticEmailData {
  const template = SYNTHETIC_TEMPLATES[scenario as keyof typeof SYNTHETIC_TEMPLATES];
  if (!template) {
    throw new Error(`Unknown scenario: ${scenario}`);
  }

  const syntheticValues = generateSyntheticValues(scenario, complexity, industry);

  // Select random templates
  const subject = template.subjects[Math.floor(Math.random() * template.subjects.length)];
  const bodyTemplate = template.bodyTemplates[Math.floor(Math.random() * template.bodyTemplates.length)];

  // Replace placeholders with synthetic values
  const replacePlaceholders = (text: string) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return syntheticValues[key as keyof typeof syntheticValues]?.toString() || match;
    });
  };

  const generatedSubject = replacePlaceholders(subject);
  const generatedBody = replacePlaceholders(bodyTemplate);

  // Create expected extraction based on template fields
  const expectedExtraction: Record<string, any> = {};
  template.expectedFields.forEach(field => {
    if (syntheticValues[field as keyof typeof syntheticValues] !== undefined) {
      expectedExtraction[field] = syntheticValues[field as keyof typeof syntheticValues];
    }
  });

  // Generate synthetic attachments based on scenario
  const attachments = [];
  if (scenario === 'lending-application' && Math.random() > 0.5) {
    attachments.push({
      filename: 'application_form.pdf',
      contentType: 'application/pdf',
      content: Buffer.from(`Synthetic PDF content for ${syntheticValues.applicantName} application`).toString('base64')
    });
  }

  return {
    subject: generatedSubject,
    body: generatedBody,
    attachments: attachments.length > 0 ? attachments : undefined,
    expectedExtraction,
    metadata: {
      scenario,
      industry,
      complexity,
      generatedAt: new Date(),
      syntheticDataId: uuidv4()
    }
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const requestData: SyntheticDataRequest = await request.json();
    const { clientId } = await params;

    // Validate request
    if (!requestData.scenario || !requestData.count || requestData.count < 1 || requestData.count > 50) {
      return NextResponse.json(
        { error: 'Invalid request. Scenario required and count must be between 1-50' },
        { status: 400 }
      );
    }

    // Get client
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Generate synthetic emails
    const generatedEmails: SyntheticEmailData[] = [];
    for (let i = 0; i < requestData.count; i++) {
      try {
        const syntheticEmail = generateSyntheticEmail(
          requestData.scenario,
          requestData.complexity || 'medium',
          requestData.industry || 'finance'
        );
        generatedEmails.push(syntheticEmail);
      } catch (error) {
        console.error(`Error generating synthetic email ${i + 1}:`, error);
      }
    }

    // Record generation in client's metadata
    const generationRecord = {
      timestamp: new Date(),
      scenarioType: requestData.scenario,
      dataCount: generatedEmails.length,
      status: 'success' as const
    };

    await Client.findByIdAndUpdate(clientId, {
      $push: {
        'emailTesting.syntheticDataConfig.generationHistory': generationRecord
      },
      $set: {
        'emailTesting.syntheticDataConfig.enabled': true
      }
    });

    return NextResponse.json({
      success: true,
      generatedCount: generatedEmails.length,
      emails: generatedEmails,
      metadata: {
        scenario: requestData.scenario,
        complexity: requestData.complexity || 'medium',
        industry: requestData.industry || 'finance',
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error generating synthetic data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { clientId } = await params;

    // Get client with generation history
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const generationHistory = client.emailTesting?.syntheticDataConfig?.generationHistory || [];
    const isEnabled = client.emailTesting?.syntheticDataConfig?.enabled || false;

    return NextResponse.json({
      enabled: isEnabled,
      generationHistory,
      totalGenerated: generationHistory.reduce((sum: number, record: any) => sum + record.dataCount, 0),
      availableScenarios: Object.keys(SYNTHETIC_TEMPLATES),
      supportedIndustries: ['finance', 'lending', 'broker'],
      complexityLevels: ['simple', 'medium', 'complex']
    });

  } catch (error) {
    console.error('Error fetching synthetic data history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}