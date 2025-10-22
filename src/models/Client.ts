import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  pocName: { type: String, required: true },
  pocContact: { type: String, required: true },
  type: {
    type: String,
    enum: ['BROKER', 'LENDER'],
    required: true
  },
  website: { type: String },
  companyName: { type: String, required: true },
  companyNumber: { type: Number },
  address: { type: String },
  country: { type: String },
  isActive: { type: Boolean, default: true },
  onboardedAt: Number,
  createdAt: Number,
  updatedAt: Number,
  carFinanceDomain: { type: Boolean, default: false },
  propertyFinanceDomain: { type: Boolean, default: false },
  smeFinanceDomain: { type: Boolean, default: false },
  clientCode: {
    type: String,
    required: true,
    unique: true
  },
  emailDomain: { type: String, required: true, unique: true },
  nylasGrantId: String,
  emailAction: String,
  adminEmail: [String],
  enquireEmail: String,
  responsePrompts: {
    generalCase: String,
    noNextQuestionsCase: String,
    irrelevantCase: String
  },
  followUpConfig: {
    isActive: Boolean,
    configType: String,
    flatGapInterval: [Number],
    noOfFollowUps: Number
  },
  feature_flags: {
    ntropyProcessing: Boolean,
    directorSearch: Boolean,
    bypassBusinessAccNameValidation: Boolean,
    propertyEnrichment: Boolean,
    linkExtraction: Boolean,
    bankStatements: Boolean,
    isEmailLabellingDisabled: Boolean
  },
  unified: {
    messaging: String,
    crm: [{
      app: String,
      connectionId: String,
      isActive: Boolean,
      apiKey: String
    }]
  },
  bankStatementValidationConfig: {
    validDateRangeInMonth: String,
    excludedBankNames: [String]
  },
  ruleCriteria: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  indicativeTermsCalcVariables: {
    base_rate_pa: Number,
    fees: {
      admin_fee_bridge: Number,
      admin_fee_refurb: Number,
      arrange_perc: Number,
      proc_perc: Number,
      avm_cost_gbp: Number
    },
    loan_limits: {
      least_day_one_loan: Number,
      max_day_one_loan: Number,
      max_loan_term: Number,
      default_loan_term: Number,
      min_loan_term: Number
    },
    refurb_config: {
      max_refurb_amount: Number,
      tranche_config: {
        number_of_tranches: Number,
        tranche_months: [Number]
      }
    },
    ltv_caps: {
      day_one: {
        default: Number,
        semi_commercial: Number,
        refurb: Number
      },
      term_end: {
        default: Number,
        semi_commercial: Number,
        refurb: Number
      }
    },
    hurdle_matrix: [[Number]],
    risk_factors: {
      refurb_points: Number,
      adverse_credit_points: Number,
      high_risk_property_types: [String],
      non_uk_nationality_points: Number,
      hmo_bedroom_threshold: Number
    },
    property_type_configs: {
      handover_property_types: [String]
    }
  },
  whitelistedDomains: [String],
  auditJobMetadata: {
    jobExecutionInProgress: Boolean,
    emailsAuditedUpToTimestamp: Date
  },
  pandaDoc: {
    docTemplates: [{
      docName: String,
      templateId: String
    }]
  },
  vectorDbParams: {
    pineconeApiKey: String,
    pineconeIndexName: String,
    RagContextDocCount: Number
  },
  requiredDocuments: [String],
  detailsRequired: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  emailTesting: {
    isEnabled: { type: Boolean, default: false },
    testEnvironment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox'
    },
    dedicatedTestEmails: [String],
    gmailConfig: {
      serviceAccountEmail: String,
      adminEmail: String,
      testEmailPrefix: String,
      // OAuth fields
      accessToken: String,
      refreshToken: String,
      tokenExpiry: Number,
      isAuthorized: { type: Boolean, default: false },
      authorizedEmail: String
    },
    testCases: [{
      id: String,
      name: String,
      description: String,
      category: String,
      emailTemplate: {
        subject: String,
        body: String,
        attachments: [{
          filename: String,
          contentType: String,
          content: String // base64 encoded
        }]
      },
      expectedExtraction: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      metadata: {
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        lastRun: Date,
        successRate: Number,
        averageAccuracy: Number
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }],
    testResults: [{
      id: String,
      testCaseId: String,
      executedAt: Date,
      status: { type: String, enum: ['pass', 'fail', 'partial'], required: true },
      emailSent: Boolean,
      emailDelivered: Boolean,
      responseReceived: Boolean,
      aiExtraction: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      validationResults: [{
        field: String,
        expected: String,
        actual: String,
        match: Boolean,
        confidence: Number
      }],
      performance: {
        emailDeliveryTime: Number,
        aiProcessingTime: Number,
        totalTime: Number
      },
      errorDetails: String
    }],
    // New fields for enhanced functionality
    syntheticDataConfig: {
      enabled: { type: Boolean, default: false },
      industry: { type: String, enum: ['finance', 'lending', 'broker'], default: 'finance' },
      scenarioTypes: [String],
      generationHistory: [{
        timestamp: Date,
        scenarioType: String,
        dataCount: Number,
        status: { type: String, enum: ['success', 'failed'] }
      }]
    },

    aiAnalysisConfig: {
      enabled: { type: Boolean, default: false },
      validationThreshold: { type: Number, default: 0.85 },
      autoRetryOnFailure: { type: Boolean, default: false },
      analysisProviders: [String],
      lastAnalysis: Date
    },

    executionMetrics: {
      queueSize: { type: Number, default: 0 },
      parallelLimit: { type: Number, default: 3 },
      retryAttempts: { type: Number, default: 1 },
      timeoutSettings: {
        emailDelivery: { type: Number, default: 10000 },
        aiProcessing: { type: Number, default: 20000 },
        total: { type: Number, default: 30000 }
      }
    },

    advancedAnalytics: {
      enabled: { type: Boolean, default: false },
      retentionPeriod: { type: Number, default: 90 }, // days
      trendAnalysis: { type: Boolean, default: false },
      complianceReporting: { type: Boolean, default: false }
    },

    analytics: {
      totalTestsRun: { type: Number, default: 0 },
      overallSuccessRate: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      lastTestRun: Date,
      trendData: [{
        date: Date,
        successRate: Number,
        accuracy: Number,
        testsRun: Number
      }]
    },
    notifications: {
      onTestComplete: { type: Boolean, default: true },
      onTestFailure: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['email', 'slack', 'webhook'] }],
      webhookUrl: String,
      slackChannel: String
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Client || mongoose.model('Client', clientSchema); 