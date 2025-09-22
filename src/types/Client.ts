export interface Client {
  _id?: string;
  pocName: string;
  pocContact: string;
  type: 'BROKER' | 'LENDER';
  website: string;
  companyName: string;
  companyNumber: number;
  address: string;
  country: string;
  isActive: boolean;
  onboardedAt?: number;
  createdAt?: number;
  updatedAt?: number;
  carFinanceDomain: boolean;
  propertyFinanceDomain: boolean;
  smeFinanceDomain: boolean;
  clientCode: string;
  emailDomain: string;
  nylasGrantId?: string;
  emailAction?: string;
  adminEmail?: string[];
  enquireEmail?: string;
  responsePrompts?: {
    generalCase?: string;
    noNextQuestionsCase?: string;
    irrelevantCase?: string;
  };
  followUpConfig?: {
    isActive?: boolean;
    configType?: string;
    flatGapInterval?: number[];
    noOfFollowUps?: number;
  };
  feature_flags?: {
    ntropyProcessing?: boolean;
    directorSearch?: boolean;
    bypassBusinessAccNameValidation?: boolean;
    propertyEnrichment?: boolean;
    linkExtraction?: boolean;
    bankStatements?: boolean;
    isEmailLabellingDisabled?: boolean;
  };
  unified?: {
    messaging?: string;
    crm?: Array<{
      app: string;
      connectionId: string;
      isActive: boolean;
      apiKey: string;
    }>;
  };
  bankStatementValidationConfig?: {
    validDateRangeInMonth?: string;
    excludedBankNames?: string[];
  };
  ruleCriteria?: {
    loanAmount?: {
      hardDecline?: {
        upperBound?: number;
        lowerBound?: number;
      };
      humanHandover?: {
        upperBound?: number;
        lowerBound?: number;
      };
      isHardDecline?: boolean;
      isHumanHandover?: boolean;
    };
    ltvCriteria?: {
      hardDecline?: {
        maxLtvPercentage?: number;
      };
      humanHandover?: {
        maxLtvPercentage?: number;
      };
      isHardDecline?: boolean;
      isHumanHandover?: boolean;
    };
  };
  indicativeTermsCalcVariables?: {
    base_rate_pa?: number;
    fees?: {
      admin_fee_bridge?: number;
      admin_fee_refurb?: number;
      arrange_perc?: number;
      proc_perc?: number;
      avm_cost_gbp?: number;
    };
    loan_limits?: {
      least_day_one_loan?: number;
      max_day_one_loan?: number;
      max_loan_term?: number;
      default_loan_term?: number;
      min_loan_term?: number;
    };
    refurb_config?: {
      max_refurb_amount?: number;
      tranche_config?: {
        number_of_tranches?: number;
        tranche_months?: number[];
      };
    };
    ltv_caps?: {
      day_one?: {
        default?: number;
        semi_commercial?: number;
        refurb?: number;
      };
      term_end?: {
        default?: number;
        semi_commercial?: number;
        refurb?: number;
      };
    };
    hurdle_matrix?: number[][];
    risk_factors?: {
      refurb_points?: number;
      adverse_credit_points?: number;
      high_risk_property_types?: string[];
      non_uk_nationality_points?: number;
      hmo_bedroom_threshold?: number;
    };
    property_type_configs?: {
      handover_property_types?: string[];
    };
  };
  whitelistedDomains?: string[];
  auditJobMetadata?: {
    jobExecutionInProgress?: boolean;
    emailsAuditedUpToTimestamp?: Date;
  };
  pandaDoc?: {
    docTemplates?: Array<{
      docName: string;
      templateId: string;
    }>;
  };
  vectorDbParams?: {
    pineconeApiKey?: string;
    pineconeIndexName?: string;
    RagContextDocCount?: number;
  };
  requiredDocuments?: string[];
  detailsRequired?: Record<string, Record<string, any>>;
} 